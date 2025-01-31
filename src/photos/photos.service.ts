import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Photo } from './entities/photo.entity';
import { PhotoResponseDto } from './dto/upload-photo.dto';
// import { Express } from 'express'

@Injectable()
export class PhotosService {
  private readonly s3: S3;

  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    private configService: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadPhoto(
    file: Express.Multer.File,
    userId: string,
  ): Promise<PhotoResponseDto> {
    const { originalname, mimetype, size, buffer } = file;
    const filename = `${Date.now()}-${originalname}`;

    // Upload to S3
    const bucket = this.configService.get('AWS_S3_BUCKET');
    if (!bucket) {
      throw new Error('AWS S3 bucket not configured');
    }
    const uploadResult = await this.s3
      .upload({
        Bucket: bucket,
        Key: `photos/${filename}`,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read',
      })
      .promise();

    // Save metadata to database
    const photo = this.photoRepository.create({
      filename,
      originalname,
      mimetype,
      size,
      url: uploadResult.Location,
      userId,
    });

    await this.photoRepository.save(photo);

    return this.mapToDto(photo);
  }

  async getPhotos(userId: string): Promise<PhotoResponseDto[]> {
    const photos = await this.photoRepository.find({
      where: { userId },
      order: { uploadedAt: 'DESC' },
    });

    return photos.map(this.mapToDto);
  }

  async deletePhoto(id: string, userId: string): Promise<void> {
    const photo = await this.photoRepository.findOne({
      where: { id, userId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Delete from S3
    const bucket = this.configService.get('AWS_S3_BUCKET');
    if (!bucket) {
      throw new Error('AWS S3 bucket not configured');
    }
    await this.s3
      .deleteObject({
        Bucket: bucket,
        Key: `photos/${photo.filename}`,
      })
      .promise();

    // Delete from database
    await this.photoRepository.remove(photo);
  }

  getPhotosByIds(photoIds: string[]) {
    return this.photoRepository.findByIds(photoIds);
  }

  private mapToDto(photo: Photo): PhotoResponseDto {
    return {
      id: photo.id,
      filename: photo.filename,
      originalname: photo.originalname,
      url: photo.url,
      uploadedAt: photo.uploadedAt,
    };
  }
}
