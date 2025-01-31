import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profilesService: ProfileService) {}

  @Post()
  create(@Request() req, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(req.user.id, createProfileDto);
  }

  @Get('me')
  getMyProfile(@Request() req) {
    return this.profilesService.findOne(req.user.id);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.profilesService.findOne(+userId);
  }

  @Put('me')
  update(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(req.user.id, updateProfileDto);
  }
}
