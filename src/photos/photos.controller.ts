import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './services/photos.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { User } from '@/decorators/user.decorator';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @User('id') userId: string,
  ) {
    return this.photosService.uploadPhoto(file, userId);
  }

  @Get()
  async getPhotos(@User('id') userId: string) {
    return this.photosService.getPhotos(userId);
  }

  @Delete(':id')
  async deletePhoto(@Param('id') id: string, @User('id') userId: string) {
    await this.photosService.deletePhoto(id, userId);
    return { message: 'Photo deleted successfully' };
  }
}
