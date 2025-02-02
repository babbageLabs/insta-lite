import { Module } from '@nestjs/common';
import { PhotosService } from './services/photos.service';
import { PhotosController } from './photos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Photo } from './entities/photo.entity';
import { PhotoInteractionsController } from './controllers/photo-interactions.controller';
import { PhotoInteractionsService } from './services/photo-interactions.service';
import { PhotoLike } from './entities/photo-like.entity';
import { PhotoComment } from './entities/photo-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Photo, PhotoLike, PhotoComment]),
    ConfigModule,
  ],
  providers: [PhotosService, PhotoInteractionsService],
  controllers: [PhotosController, PhotoInteractionsController],
  exports: [PhotosService],
})
export class PhotosModule {}
