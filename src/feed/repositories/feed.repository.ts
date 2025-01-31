import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedItem } from '../entities/feed-item.entity';

@Injectable()
export class FeedRepository {
  constructor(
    @InjectRepository(FeedItem)
    private readonly repository: Repository<FeedItem>,
  ) {}

  async createFeedItem(
    userId: number,
    photoId: string,
    creatorId: number,
  ): Promise<FeedItem> {
    const feedItem = this.repository.create({
      userId,
      photoId,
      creatorId,
    });
    return this.repository.save(feedItem);
  }

  async getFeedItems(
    userId: number,
    followedUserIds: string[],
    limit: number,
    cursor?: string,
  ): Promise<[FeedItem[], boolean]> {
    const query = this.repository
      .createQueryBuilder('feed')
      .where('feed.userId = :userId', { userId })
      .orWhere('feed.creatorId IN (:...followedUserIds)', { followedUserIds })
      .orderBy('feed.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      query.andWhere('feed.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    const items = await query.getMany();
    const hasMore = items.length > limit;
    const finalItems = hasMore ? items.slice(0, -1) : items;

    return [finalItems, hasMore];
  }
}
