import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '@/decorators/user.decorator';
import { FollowService } from '../services/follow.service';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':userId')
  async followUser(
    @User('id') currentUserId: number,
    @Param('userId') userId: number,
  ) {
    return this.followService.followUser(currentUserId, userId);
  }

  @Delete(':userId')
  async unfollowUser(
    @User('id') currentUserId: number,
    @Param('userId') userId: number,
  ) {
    return this.followService.unfollowUser(currentUserId, userId);
  }

  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.followService.getFollowers(userId, page, limit);
  }

  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.followService.getFollowing(userId, page, limit);
  }

  @Get('stats/:userId')
  async getFollowStats(
    @Param('userId') userId: number,
    @User('id') currentUserId: number,
  ) {
    return this.followService.getFollowStats(userId, currentUserId);
  }
}
