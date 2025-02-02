import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../entities/photo.entity';
import {
  SearchPhotosDto,
  SearchPhotosResponseDto,
} from '../dto/search-photos.dto';

@Injectable()
export class PhotoSearchService {
  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
  ) {}

  async searchPhotos(
    searchDto: SearchPhotosDto,
    userId?: string,
  ): Promise<SearchPhotosResponseDto> {
    const { query, hashtags, page = 1, limit = 20 } = searchDto;

    const queryBuilder = this.photoRepository
      .createQueryBuilder('photo')
      .leftJoinAndSelect('photo.user', 'user')
      .leftJoin('photo.likes', 'likes')
      .leftJoin('photo.comments', 'comments')
      .select([
        'photo.id',
        'photo.filename',
        'photo.originalname',
        'photo.url',
        'photo.description',
        'photo.hashtags',
        'photo.uploadedAt',
        'user.id',
        'user.username',
      ])
      .addSelect('COUNT(DISTINCT likes.id)', 'likesCount')
      .addSelect('COUNT(DISTINCT comments.id)', 'commentsCount')
      .groupBy('photo.id')
      .addGroupBy('user.id');

    // Apply search filters
    if (query) {
      queryBuilder.andWhere(
        '(photo.description ILIKE :query OR photo.originalname ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (hashtags && hashtags.length > 0) {
      queryBuilder.andWhere('photo.hashtags @> :hashtags', { hashtags });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Add pagination
    const skip = (page - 1) * limit;
    queryBuilder.orderBy('photo.uploadedAt', 'DESC').skip(skip).take(limit);

    // Execute query
    const photos = await queryBuilder.getRawAndEntities();

    // Format response
    const items = photos.entities.map((photo, index) => ({
      ...photo,
      user: {
        id: photos.raw[index].user_id,
        username: photos.raw[index].user_username,
      },
      _count: {
        likes: parseInt(photos.raw[index].likesCount),
        comments: parseInt(photos.raw[index].commentsCount),
      },
    }));

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPopularHashtags(
    limit: number = 10,
  ): Promise<{ tag: string; count: number }[]> {
    const queryBuilder = this.photoRepository
      .createQueryBuilder('photo')
      .select('unnest(photo.hashtags)', 'tag')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tag')
      .orderBy('count', 'DESC')
      .limit(limit);

    return queryBuilder.getRawMany();
  }
}
