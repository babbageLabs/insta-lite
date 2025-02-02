import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repositories/feed.repository';
import { FeedPaginationDto } from './dto/feed-pagination.dto';
import { FeedResponseDto } from './dto/feed-response.dto';

import { FollowService } from '@/profile/services/follow.service';
import { PhotosService } from '@/photos/services/photos.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly followService: FollowService,
    private readonly photoService: PhotosService,
  ) {}

  async getFeed(
    userId: number,
    paginationDto: FeedPaginationDto,
  ): Promise<FeedResponseDto> {
    // Get followed users
    const [followedUsers] = await this.followService.getFollowers(userId);
    const followedUserIds = followedUsers.map((user) => user.id);

    // Get feed items with pagination
    const [feedItems, hasMore] = await this.feedRepository.getFeedItems(
      userId,
      followedUserIds,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    // Get photo details for feed items
    const photoIds = feedItems.map((item) => item.photoId);
    const photos = await this.photoService.getPhotosByIds(photoIds);

    // Map photos to feed items
    const items = feedItems.map((item) => {
      const photo = photos.find((p) => p.id === item.photoId);
      return {
        ...item,
        photo,
      };
    });

    // Prepare response
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async addToFeed(photoId: string, creatorId: number): Promise<void> {
    // Get creator's followers
    const [followers] = await this.followService.getFollowers(creatorId);

    // Create feed items for each follower
    const feedPromises = followers.map((follower) =>
      this.feedRepository.createFeedItem(
        follower.followerId,
        photoId,
        creatorId,
      ),
    );

    // Also create feed item for the creator
    feedPromises.push(
      this.feedRepository.createFeedItem(creatorId, photoId, creatorId),
    );

    await Promise.all(feedPromises);
  }
}
