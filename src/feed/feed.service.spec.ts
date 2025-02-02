import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { FeedRepository } from './repositories/feed.repository';
import { FollowService } from '@/profile/services/follow.service';
import { PhotosService } from '@/photos/services/photos.service';
import { FeedPaginationDto } from './dto/feed-pagination.dto';
import { FeedResponseDto } from './dto/feed-response.dto';
import { Follow } from '@/profile/entities/follow.entity';
import { FollowResponseDto } from '@/profile/dto/follow-response.dto';
import { FeedItem } from './entities/feed-item.entity';
import { Photo } from '@/photos/entities/photo.entity';

describe('FeedService', () => {
  let service: FeedService;
  let feedRepository: FeedRepository;
  let followService: FollowService;
  let photoService: PhotosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: FeedRepository,
          useValue: {
            getFeedItems: jest.fn(),
            createFeedItem: jest.fn(),
          },
        },
        {
          provide: FollowService,
          useValue: {
            getFollowers: jest.fn(),
          },
        },
        {
          provide: PhotosService,
          useValue: {
            getPhotosByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    feedRepository = module.get<FeedRepository>(FeedRepository);
    followService = module.get<FollowService>(FollowService);
    photoService = module.get<PhotosService>(PhotosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeed', () => {
    it('should return feed items with photos', async () => {
      const userId = 1;
      const paginationDto: FeedPaginationDto = { limit: 10 };
      // const followedUsers = [{ id: 2 }];
      const followedUsers: FollowResponseDto[] = [
        {
          id: 'follow1',
          followerId: 2,
          followingId: 1,
          createdAt: new Date(),
          follower: {
            id: 2,
            username: 'follower',
            avatarUrl: 'follower.jpg',
          },
          following: {
            id: 1,
            username: 'following',
            avatarUrl: 'following.jpg',
          },
        },
      ];
      const feedItems: FeedItem[] = [
        {
          id: 'feed1',
          photoId: 'photo1',
          createdAt: new Date(),
          userId: 2,
          creatorId: 1,
        },
      ];
      const photos: Photo[] = [
        {
          id: 'photo1',
          url: 'photo-url',
          userId: '2',
          filename: 'photo.jpg',
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
          size: 1000,
          uploadedAt: new Date(),
        },
      ];

      jest
        .spyOn(followService, 'getFollowers')
        .mockResolvedValue([followedUsers, followedUsers.length]);
      jest
        .spyOn(feedRepository, 'getFeedItems')
        .mockResolvedValue([feedItems, false]);
      jest.spyOn(photoService, 'getPhotosByIds').mockResolvedValue(photos);

      const result = await service.getFeed(userId, paginationDto);

      expect(result).toEqual({
        items: [{ ...feedItems[0], photo: photos[0] }],
        nextCursor: null,
        hasMore: false,
      });
    });
  });

  describe('addToFeed', () => {
    it('should create feed items for followers and creator', async () => {
      const photoId = 'photo1';
      const creatorId = 1;
      const followers: FollowResponseDto[] = [
        {
          followerId: 2,
          followingId: 1,
          createdAt: new Date(),
          follower: {
            id: 2,
            username: 'follower',
            avatarUrl: 'follower.jpg',
          },
          following: {
            id: 1,
            username: 'following',
            avatarUrl: 'following.jpg',
          },
          id: 'follow1',
        },
      ];

      jest
        .spyOn(followService, 'getFollowers')
        .mockResolvedValue([followers, 1]);
      const createFeedItemSpy = jest
        .spyOn(feedRepository, 'createFeedItem')
        .mockResolvedValue({} as FeedItem);

      await service.addToFeed(photoId, creatorId);

      expect(createFeedItemSpy).toHaveBeenCalledTimes(followers.length + 1);
      expect(createFeedItemSpy).toHaveBeenCalledWith(2, photoId, creatorId);
      expect(createFeedItemSpy).toHaveBeenCalledWith(
        creatorId,
        photoId,
        creatorId,
      );
    });
  });
});
