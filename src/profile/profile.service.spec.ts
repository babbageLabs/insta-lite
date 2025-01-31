import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileService } from './profile.service';
import { Profile } from './entities/profile.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProfilesService', () => {
  let service: ProfileService;
  let repository: Repository<Profile>;

  const mockProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      const createProfileDto = {
        fullName: 'John Doe',
        bio: 'Test bio',
      };
      const userId = 1;

      const expectedProfile = {
        id: 1,
        ...createProfileDto,
        userId,
      };

      mockProfileRepository.create.mockReturnValue(expectedProfile);
      mockProfileRepository.save.mockResolvedValue(expectedProfile);

      const result = await service.create(userId, createProfileDto);
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('findOne', () => {
    it('should return a profile if found', async () => {
      const userId = 1;
      const mockProfile = {
        id: 1,
        fullName: 'John Doe',
        userId,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findOne(userId);
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const userId = 1;
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
