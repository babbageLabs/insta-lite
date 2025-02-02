import { Test, TestingModule } from '@nestjs/testing';
import { PhotosController } from './photos.controller';
import { PhotosService } from './services/photos.service';

describe('PhotosController', () => {
  let controller: PhotosController;
  let service: PhotosService;

  const mockPhoto = {
    id: '123',
    filename: 'test.jpg',
    originalname: 'test.jpg',
    url: 'https://example.com/test.jpg',
    uploadedAt: new Date(),
  };

  const mockFile = {
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotosController],
      providers: [
        {
          provide: PhotosService,
          useValue: {
            uploadPhoto: jest.fn().mockResolvedValue(mockPhoto),
            getPhotos: jest.fn().mockResolvedValue([mockPhoto]),
            deletePhoto: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<PhotosController>(PhotosController);
    service = module.get<PhotosService>(PhotosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadPhoto', () => {
    it('should upload a photo successfully', async () => {
      const result = await controller.uploadPhoto(mockFile as any, 'user123');

      expect(result).toEqual(mockPhoto);
      expect(service.uploadPhoto).toHaveBeenCalledWith(mockFile, 'user123');
    });
  });

  describe('getPhotos', () => {
    it('should return an array of photos', async () => {
      const result = await controller.getPhotos('user123');

      expect(result).toEqual([mockPhoto]);
      expect(service.getPhotos).toHaveBeenCalledWith('user123');
    });
  });

  describe('deletePhoto', () => {
    it('should delete a photo successfully', async () => {
      const result = await controller.deletePhoto('123', 'user123');

      expect(result).toEqual({ message: 'Photo deleted successfully' });
      expect(service.deletePhoto).toHaveBeenCalledWith('123', 'user123');
    });
  });
});
