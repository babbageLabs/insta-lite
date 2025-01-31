import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FollowRepository } from '../repositories/follow.repository';
import { ProfileService } from '../../profile/services/profile.service';
import { Follow } from '../entities/follow.entity';
import { FollowStatsDto } from '../dto/follow-response.dto';

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly profileService: ProfileService,
  ) {}

  async followUser(followerId: number, followingId: number): Promise<Follow> {
    // Check if users exist
    await this.profileService.findOne(followerId);
    await this.profileService.findOne(followingId);

    // Prevent self-following
    if (followerId === followingId) {
      throw new ConflictException('Users cannot follow themselves');
    }

    // Check if already following
    const existingFollow = await this.followRepository.findFollow(
      followerId,
      followingId,
    );
    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    return this.followRepository.createFollow(followerId, followingId);
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const follow = await this.followRepository.findFollow(
      followerId,
      followingId,
    );
    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.removeFollow(followerId, followingId);
  }

  async getFollowers(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<[Follow[], number]> {
    const offset = (page - 1) * limit;
    return this.followRepository.getFollowers(userId, limit, offset);
  }

  async getFollowing(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<[Follow[], number]> {
    const offset = (page - 1) * limit;
    return this.followRepository.getFollowing(userId, limit, offset);
  }

  async getFollowStats(
    userId: number,
    currentUserId?: number,
  ): Promise<FollowStatsDto> {
    const [followersCount, followingCount] = await Promise.all([
      this.followRepository.countFollowers(userId),
      this.followRepository.countFollowing(userId),
    ]);

    let isFollowing = false;
    if (currentUserId) {
      const follow = await this.followRepository.findFollow(
        currentUserId,
        userId,
      );
      isFollowing = !!follow;
    }

    return {
      followersCount,
      followingCount,
      isFollowing,
    };
  }

  async getFollowingIds(userId: number): Promise<number[]> {
    return this.followRepository.getFollowingIds(userId);
  }

  async getFollowerIds(userId: number): Promise<number[]> {
    return this.followRepository.getFollowerIds(userId);
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followRepository.findFollow(
      followerId,
      followingId,
    );
    return !!follow;
  }
}
