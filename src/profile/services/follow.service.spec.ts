import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowRepository } from '../repositories/follow.repository';
import { ProfileService } from '../../profile/services/profile.service';
import { Follow } from '../entities/follow.entity';

describe('FollowService', () => {
  let followService: FollowService;
  let followRepository: jest.Mocked<FollowRepository>;
  let profileService: jest.Mocked<ProfileService>;

  const mockProfile = {
    id: 1,
    username: 'follower',
    avatarUrl: 'follower.jpg',
    fullName: '',
    bio: '',
    avatar: '',
    location: '',
    followersCount: 0,
    followingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 1,
      email: 'follower@email.com',
      password: 'password',
    },
    userId: 1,
  };

  const follower2 = {
    id: 2,
    username: 'follower2',
    avatarUrl: 'follower2.jpg',
    fullName: '',
    bio: '',
    avatar: '',
    location: '',
    followersCount: 0,
    followingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 2,
      email: 'follower2@email.com',
      password: 'password',
    },
    userId: 2,
  };

  const mockFollow: Follow = {
    id: 'uuid-1',
    followerId: 1,
    followingId: 2,
    createdAt: new Date(),
    follower: mockProfile,
    following: follower2,
  };

  beforeEach(async () => {
    const followRepositoryMock = {
      findFollow: jest.fn(),
      createFollow: jest.fn(),
      removeFollow: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn(),
      countFollowers: jest.fn(),
      countFollowing: jest.fn(),
      getFollowingIds: jest.fn(),
      getFollowerIds: jest.fn(),
    };

    const profileServiceMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        {
          provide: FollowRepository,
          useValue: followRepositoryMock,
        },
        {
          provide: ProfileService,
          useValue: profileServiceMock,
        },
      ],
    }).compile();

    followService = module.get<FollowService>(FollowService);
    followRepository = module.get(FollowRepository);
    profileService = module.get(ProfileService);
  });

  describe('followUser', () => {
    it('should successfully create a follow relationship', async () => {
      profileService.findOne.mockResolvedValueOnce(mockProfile);
      profileService.findOne.mockResolvedValueOnce(follower2);
      followRepository.findFollow.mockResolvedValueOnce(null);
      followRepository.createFollow.mockResolvedValueOnce(mockFollow);

      const result = await followService.followUser(1, 2);

      expect(result).toEqual({
        id: mockFollow.id,
        followerId: 1,
        followingId: 2,
        createdAt: mockFollow.createdAt,
        follower: {
          id: 1,
          username: mockProfile.username,
          avatarUrl: mockProfile.avatarUrl,
        },
        following: {
          id: 2,
          username: follower2.username,
          avatarUrl: follower2.avatarUrl,
        },
      });
      expect(profileService.findOne).toHaveBeenCalledTimes(2);
      expect(followRepository.createFollow).toHaveBeenCalledWith(1, 2);
    });

    it('should throw ConflictException when user tries to follow themselves', async () => {
      await expect(followService.followUser(1, 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when already following', async () => {
      profileService.findOne.mockResolvedValueOnce(mockProfile);
      profileService.findOne.mockResolvedValueOnce(follower2);
      followRepository.findFollow.mockResolvedValueOnce(mockFollow);

      await expect(followService.followUser(1, 2)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow user', async () => {
      followRepository.findFollow.mockResolvedValueOnce(mockFollow);

      await followService.unfollowUser(1, 2);

      expect(followRepository.removeFollow).toHaveBeenCalledWith(1, 2);
    });

    it('should throw NotFoundException when follow relationship does not exist', async () => {
      followRepository.findFollow.mockResolvedValueOnce(null);

      await expect(followService.unfollowUser(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFollowers', () => {
    it('should return followers with pagination', async () => {
      const mockFollows = [mockFollow];
      const totalCount = 1;
      followRepository.getFollowers.mockResolvedValueOnce([
        mockFollows,
        totalCount,
      ]);

      const [followers, count] = await followService.getFollowers(1);

      expect(count).toBe(totalCount);
      expect(followers).toHaveLength(1);
      expect(followers[0].followerId).toBe(1);
      expect(followRepository.getFollowers).toHaveBeenCalledWith(1, 20, 0);
    });
  });

  describe('getFollowing', () => {
    it('should return following with pagination', async () => {
      const mockFollows = [mockFollow];
      const totalCount = 1;
      followRepository.getFollowing.mockResolvedValueOnce([
        mockFollows,
        totalCount,
      ]);

      const [following, count] = await followService.getFollowing(1);

      expect(count).toBe(totalCount);
      expect(following).toHaveLength(1);
      expect(following[0].followingId).toBe(2);
      expect(followRepository.getFollowing).toHaveBeenCalledWith(1, 20, 0);
    });
  });

  describe('getFollowStats', () => {
    it('should return follow statistics', async () => {
      followRepository.countFollowers.mockResolvedValueOnce(5);
      followRepository.countFollowing.mockResolvedValueOnce(10);
      followRepository.findFollow.mockResolvedValueOnce(mockFollow);

      const stats = await followService.getFollowStats(1, 2);

      expect(stats).toEqual({
        followersCount: 5,
        followingCount: 10,
        isFollowing: true,
      });
    });

    it('should return follow statistics without checking isFollowing', async () => {
      followRepository.countFollowers.mockResolvedValueOnce(5);
      followRepository.countFollowing.mockResolvedValueOnce(10);

      const stats = await followService.getFollowStats(1);

      expect(stats).toEqual({
        followersCount: 5,
        followingCount: 10,
        isFollowing: false,
      });
    });
  });

  describe('getFollowingIds', () => {
    it('should return following ids as strings', async () => {
      followRepository.getFollowingIds.mockResolvedValueOnce([1, 2, 3]);

      const ids = await followService.getFollowingIds(1);

      expect(ids).toEqual(['1', '2', '3']);
    });
  });

  describe('getFollowerIds', () => {
    it('should return follower ids as strings', async () => {
      followRepository.getFollowerIds.mockResolvedValueOnce([1, 2, 3]);

      const ids = await followService.getFollowerIds(1);

      expect(ids).toEqual(['1', '2', '3']);
    });
  });

  describe('isFollowing', () => {
    it('should return true when follow relationship exists', async () => {
      followRepository.findFollow.mockResolvedValueOnce(mockFollow);

      const result = await followService.isFollowing(1, 2);

      expect(result).toBe(true);
    });

    it('should return false when follow relationship does not exist', async () => {
      followRepository.findFollow.mockResolvedValueOnce(null);

      const result = await followService.isFollowing(1, 2);

      expect(result).toBe(false);
    });
  });
});
