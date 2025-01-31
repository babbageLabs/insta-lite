import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { FollowService } from './services/follow.service';
import { FollowController } from './controllers/follow.controller';
import { FollowRepository } from './repositories/follow.repository';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    TypeOrmModule.forFeature([Follow]),
  ],
  providers: [ProfileService, FollowService, FollowRepository],
  controllers: [ProfileController, FollowController],
  exports: [ProfileService, FollowService],
})
export class ProfileModule {}
