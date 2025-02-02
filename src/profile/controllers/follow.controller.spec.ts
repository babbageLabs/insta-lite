import { Test, TestingModule } from '@nestjs/testing';
import { FollowController } from './follow.controller';
import { FollowService } from '../services/follow.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FollowResponseDto } from '../dto/follow-response.dto';

describe('FollowController', () => {
  let controller: FollowController;
  let followService: jest.Mocked<FollowService>;

  const mockFollowResponse = {
    id: 'uuid-1',
    followerId: 1,
    followingId: 2,
    createdAt: new Date(),
    follower: {
      id: 1,
      username: 'follower',
      avatarUrl: 'follower.jpg',
    },
    following: {
      id: 2,
      username: 'following',
      avatarUrl: 'following.jpg',
    },
  };

  beforeEach(async () => {
    const followServiceMock = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn(),
      getFollowStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        {
          provide: FollowService,
          useValue: followServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FollowController>(FollowController);
    followService = module.get(FollowService);
  });

  describe('followUser', () => {
    it('should create a follow relationship', async () => {
      const currentUserId = 1;
      const userId = 2;

      followService.followUser.mockResolvedValueOnce(mockFollowResponse);

      const result = await controller.followUser(currentUserId, userId);

      expect(result).toBe(mockFollowResponse);
      expect(followService.followUser).toHaveBeenCalledWith(
        currentUserId,
        userId,
      );
    });
  });

  describe('unfollowUser', () => {
    it('should remove a follow relationship', async () => {
      const currentUserId = 1;
      const userId = 2;

      followService.unfollowUser.mockResolvedValueOnce(undefined);

      await controller.unfollowUser(currentUserId, userId);

      expect(followService.unfollowUser).toHaveBeenCalledWith(
        currentUserId,
        userId,
      );
    });
  });

  describe('getFollowers', () => {
    it('should get followers with default pagination', async () => {
      const userId = 1;
      const mockResponse: [FollowResponseDto[], number] = [
        [mockFollowResponse],
        1,
      ];

      followService.getFollowers.mockResolvedValueOnce(mockResponse);

      const result = await controller.getFollowers(userId);

      expect(result).toBe(mockResponse);
      expect(followService.getFollowers).toHaveBeenCalledWith(userId, 1, 20);
    });

    it('should get followers with custom pagination', async () => {
      const userId = 1;
      const page = 2;
      const limit = 10;
      const mockResponse: [FollowResponseDto[], number] = [
        [mockFollowResponse],
        1,
      ];

      followService.getFollowers.mockResolvedValueOnce(mockResponse);

      const result = await controller.getFollowers(userId, page, limit);

      expect(result).toBe(mockResponse);
      expect(followService.getFollowers).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
    });
  });

  describe('getFollowing', () => {
    it('should get following with default pagination', async () => {
      const userId = 1;
      const mockResponse: [FollowResponseDto[], number] = [
        [mockFollowResponse],
        1,
      ];

      followService.getFollowing.mockResolvedValueOnce(mockResponse);

      const result = await controller.getFollowing(userId);

      expect(result).toBe(mockResponse);
      expect(followService.getFollowing).toHaveBeenCalledWith(userId, 1, 20);
    });

    it('should get following with custom pagination', async () => {
      const userId = 1;
      const page = 2;
      const limit = 10;
      const mockResponse: [FollowResponseDto[], number] = [
        [mockFollowResponse],
        1,
      ];

      followService.getFollowing.mockResolvedValueOnce(mockResponse);

      const result = await controller.getFollowing(userId, page, limit);

      expect(result).toBe(mockResponse);
      expect(followService.getFollowing).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
    });
  });

  describe('getFollowStats', () => {
    it('should get follow statistics', async () => {
      const userId = 1;
      const currentUserId = 2;
      const mockStats = {
        followersCount: 5,
        followingCount: 10,
        isFollowing: true,
      };

      followService.getFollowStats.mockResolvedValueOnce(mockStats);

      const result = await controller.getFollowStats(userId, currentUserId);

      expect(result).toBe(mockStats);
      expect(followService.getFollowStats).toHaveBeenCalledWith(
        userId,
        currentUserId,
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
