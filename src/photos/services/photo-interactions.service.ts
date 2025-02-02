import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoLike } from '../entities/photo-like.entity';
import { PhotoComment } from '../entities/photo-comment.entity';
import { Photo } from '../entities/photo.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PhotoInteractionDto } from '../dto/interaction-response.dto';

@Injectable()
export class PhotoInteractionsService {
  constructor(
    @InjectRepository(PhotoLike)
    private photoLikeRepository: Repository<PhotoLike>,
    @InjectRepository(PhotoComment)
    private photoCommentRepository: Repository<PhotoComment>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
  ) {}

  async likePhoto(photoId: string, userId: string): Promise<void> {
    const existingLike = await this.photoLikeRepository.findOne({
      where: { photoId, userId },
    });

    if (!existingLike) {
      const photo = await this.photoRepository.findOne({
        where: { id: photoId },
      });

      if (!photo) {
        throw new NotFoundException('Photo not found');
      }

      const like = this.photoLikeRepository.create({
        photoId,
        userId,
      });
      await this.photoLikeRepository.save(like);
    }
  }

  async unlikePhoto(photoId: string, userId: string): Promise<void> {
    const like = await this.photoLikeRepository.findOne({
      where: { photoId, userId },
    });

    if (like) {
      await this.photoLikeRepository.remove(like);
    }
  }

  async addComment(
    photoId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<PhotoComment> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const comment = this.photoCommentRepository.create({
      photoId,
      userId,
      content: createCommentDto.content,
    });

    return this.photoCommentRepository.save(comment);
  }

  async getPhotoInteractions(
    photoId: string,
    userId?: string,
  ): Promise<PhotoInteractionDto> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
      relations: ['likes', 'comments'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const likesCount = photo.likes.length;
    const commentsCount = photo.comments.length;
    const isLikedByUser = userId
      ? photo.likes.some((like) => like.userId === userId)
      : false;

    return {
      id: photo.id,
      likesCount,
      commentsCount,
      isLikedByUser,
      comments: photo.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        createdAt: comment.createdAt,
      })),
    };
  }

  async getInteractionsForPhotos(
    photoIds: string[],
    userId?: string,
  ): Promise<
    Record<
      string,
      { likesCount: number; commentsCount: number; isLikedByUser: boolean }
    >
  > {
    const photos = await this.photoRepository.findByIds(photoIds);

    return photos.reduce((acc, photo) => {
      acc[photo.id] = {
        likesCount: photo.likes.length,
        commentsCount: photo.comments.length,
        isLikedByUser: userId
          ? photo.likes.some((like) => like.userId === userId)
          : false,
      };
      return acc;
    }, {});
  }
}
