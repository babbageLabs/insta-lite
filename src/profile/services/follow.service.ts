import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FollowRepository } from '../repositories/follow.repository';
import { ProfileService } from '../../profile/services/profile.service';
import { Follow } from '../entities/follow.entity';
import { FollowResponseDto, FollowStatsDto } from '../dto/follow-response.dto';

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly profileService: ProfileService,
  ) {}

  private mapFollowToDto(follow: Follow): FollowResponseDto {
    return {
      id: follow.id,
      followerId: follow.followerId,
      followingId: follow.followingId,
      createdAt: follow.createdAt,
      follower: {
        id: follow.follower.id,
        username: follow.follower.username,
        avatarUrl: follow.follower.avatarUrl,
      },
      following: {
        id: follow.following.id,
        username: follow.following.username,
        avatarUrl: follow.following.avatarUrl,
      },
    };
  }

  async followUser(
    followerId: number,
    followingId: number,
  ): Promise<FollowResponseDto> {
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

    const follow = await this.followRepository.createFollow(
      followerId,
      followingId,
    );
    return this.mapFollowToDto(follow);
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
  ): Promise<[FollowResponseDto[], number]> {
    const offset = (page - 1) * limit;
    const [follows, count] = await this.followRepository.getFollowers(
      userId,
      limit,
      offset,
    );
    return [follows.map((follow) => this.mapFollowToDto(follow)), count];
  }

  async getFollowing(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<[FollowResponseDto[], number]> {
    const offset = (page - 1) * limit;
    const [follows, count] = await this.followRepository.getFollowing(
      userId,
      limit,
      offset,
    );
    return [follows.map((follow) => this.mapFollowToDto(follow)), count];
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

  async getFollowingIds(userId: number): Promise<string[]> {
    const ids = await this.followRepository.getFollowingIds(userId);
    return ids.map((id) => id.toString());
  }

  async getFollowerIds(userId: number): Promise<string[]> {
    const ids = await this.followRepository.getFollowerIds(userId);
    return ids.map((id) => id.toString());
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followRepository.findFollow(
      followerId,
      followingId,
    );
    return !!follow;
  }
}
