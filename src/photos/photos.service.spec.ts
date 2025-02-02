// photos/photos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PhotosService } from './photos.service';
import { Photo } from './entities/photo.entity';
import { Repository } from 'typeorm';
import { S3 } from 'aws-sdk';

describe('PhotosService', () => {
  let service: PhotosService;
  let photoRepository: Repository<Photo>;
  let mockS3: jest.Mocked<S3>;

  const mockPhoto = {
    id: '123',
    filename: 'test.jpg',
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    url: 'https://example.com/test.jpg',
    userId: 'user123',
    uploadedAt: new Date(),
  };

  const mockFile = {
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  };

  beforeEach(async () => {
    // Create mock S3 instance
    mockS3 = {
      upload: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Location: 'https://example.com/test.jpg',
        }),
      }),
      deleteObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      }),
    } as any;

    // Mock the S3 constructor
    (S3 as unknown as jest.Mock) = jest.fn().mockImplementation(() => mockS3);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotosService,
        {
          provide: getRepositoryToken(Photo),
          useValue: {
            create: jest.fn().mockReturnValue(mockPhoto),
            save: jest.fn().mockResolvedValue(mockPhoto),
            find: jest.fn().mockResolvedValue([mockPhoto]),
            findOne: jest.fn().mockResolvedValue(mockPhoto),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                AWS_S3_BUCKET: 'test-bucket',
                AWS_REGION: 'us-east-1',
                AWS_ACCESS_KEY_ID: 'test-key',
                AWS_SECRET_ACCESS_KEY: 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PhotosService>(PhotosService);
    photoRepository = module.get<Repository<Photo>>(getRepositoryToken(Photo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadPhoto', () => {
    it('should upload a photo successfully', async () => {
      const result = await service.uploadPhoto(mockFile as any, 'user123');

      expect(mockS3.upload).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockPhoto.id,
        filename: mockPhoto.filename,
        originalname: mockPhoto.originalname,
        url: mockPhoto.url,
        uploadedAt: mockPhoto.uploadedAt,
      });
      expect(photoRepository.create).toHaveBeenCalled();
      expect(photoRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if S3 upload fails', async () => {
      mockS3.upload.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Upload failed')),
        abort: jest.fn(),
        send: jest.fn(),
        on: jest.fn(),
      } as any);

      await expect(
        service.uploadPhoto(mockFile as any, 'user123'),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('getPhotos', () => {
    it('should return an array of photos for a user', async () => {
      const result = await service.getPhotos('user123');

      expect(result).toEqual([
        {
          id: mockPhoto.id,
          filename: mockPhoto.filename,
          originalname: mockPhoto.originalname,
          url: mockPhoto.url,
          uploadedAt: mockPhoto.uploadedAt,
        },
      ]);
      expect(photoRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        order: { uploadedAt: 'DESC' },
      });
    });
  });

  describe('deletePhoto', () => {
    it('should delete a photo successfully', async () => {
      await service.deletePhoto('123', 'user123');

      expect(mockS3.deleteObject).toHaveBeenCalled();
      expect(photoRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123', userId: 'user123' },
      });
      expect(photoRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if photo not found', async () => {
      jest.spyOn(photoRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deletePhoto('123', 'user123')).rejects.toThrow(
        'Photo not found',
      );
    });

    // it('should throw an error if S3 deletion fails', async () => {
    //   mockS3.deleteObject.mockReturnValue({
    //     promise: jest.fn().mockRejectedValue(new Error('Delete failed'))
    //   });

    //   await expect(service.deletePhoto('123', 'user123')).rejects.toThrow('Delete failed');
    // });
  });
});
