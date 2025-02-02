import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { FeedPaginationDto } from './dto/feed-pagination.dto';
import { User } from '@/decorators/user.decorator';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { FeedResponseDto } from './dto/feed-response.dto';

describe('FeedController', () => {
  let controller: FeedController;
  let feedService: FeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        {
          provide: FeedService,
          useValue: {
            getFeed: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<FeedController>(FeedController);
    feedService = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFeed', () => {
    it('should return feed data', async () => {
      const userId = 1;
      const paginationDto: FeedPaginationDto = { page: 1, limit: 10 };
      const result: FeedResponseDto = {
        items: [],
        nextCursor: null,
        hasMore: false,
      };

      jest.spyOn(feedService, 'getFeed').mockResolvedValue(result);

      expect(await controller.getFeed(userId, paginationDto)).toBe(result);
      expect(feedService.getFeed).toHaveBeenCalledWith(userId, paginationDto);
    });
  });
});
