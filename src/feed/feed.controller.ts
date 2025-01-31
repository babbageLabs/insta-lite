import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedPaginationDto } from './dto/feed-pagination.dto';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { User } from '@/decorators/user.decorator';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeed(
    @User('id') userId: number,
    @Query() paginationDto: FeedPaginationDto,
  ) {
    return this.feedService.getFeed(userId, paginationDto);
  }
}
