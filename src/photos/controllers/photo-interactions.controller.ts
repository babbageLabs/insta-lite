import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PhotoInteractionsService } from '../services/photo-interactions.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotoInteractionsController {
  constructor(
    private readonly photoInteractionsService: PhotoInteractionsService,
  ) {}

  @Post(':id/like')
  async likePhoto(@Param('id') photoId: string, @Request() req): Promise<void> {
    return this.photoInteractionsService.likePhoto(photoId, req.user.id);
  }

  @Delete(':id/like')
  async unlikePhoto(
    @Param('id') photoId: string,
    @Request() req,
  ): Promise<void> {
    return this.photoInteractionsService.unlikePhoto(photoId, req.user.id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') photoId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.photoInteractionsService.addComment(
      photoId,
      req.user.id,
      createCommentDto,
    );
  }

  @Get(':id/interactions')
  async getPhotoInteractions(@Param('id') photoId: string, @Request() req) {
    return this.photoInteractionsService.getPhotoInteractions(
      photoId,
      req.user.id,
    );
  }

  @Post('interactions')
  async getInteractionsForPhotos(
    @Body() { photoIds }: { photoIds: string[] },
    @Request() req,
  ) {
    return this.photoInteractionsService.getInteractionsForPhotos(
      photoIds,
      req.user.id,
    );
  }
}
