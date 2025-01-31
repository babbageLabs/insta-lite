import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedRepository } from './repositories/feed.repository';
import { FeedItem } from './entities/feed-item.entity';
import { ProfileModule } from '@/profile/profile.module';
import { PhotosModule } from '@/photos/photos.module';

@Module({
  imports: [TypeOrmModule.forFeature([FeedItem]), ProfileModule, PhotosModule],
  controllers: [FeedController],
  providers: [FeedRepository, FeedService],
  exports: [FeedService],
})
export class FeedModule {}
