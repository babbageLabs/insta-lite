// src/profiles/profiles.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from '../services/profile.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockProfilesService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfilesService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a profile', async () => {
      const createProfileDto: CreateProfileDto = {
        fullName: 'John Doe',
        bio: 'Test bio',
      };
      const req = { user: { id: 1 } };
      const expectedResult = {
        id: 1,
        ...createProfileDto,
        userId: 1,
      };

      mockProfilesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(req, createProfileDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(
        req.user.id,
        createProfileDto,
      );
    });
  });

  describe('getMyProfile', () => {
    it("should return the user's profile", async () => {
      const req = { user: { id: 1 } };
      const expectedProfile = {
        id: 1,
        fullName: 'John Doe',
        userId: 1,
      };

      mockProfilesService.findOne.mockResolvedValue(expectedProfile);

      const result = await controller.getMyProfile(req);

      expect(result).toEqual(expectedProfile);
      expect(service.findOne).toHaveBeenCalledWith(req.user.id);
    });
  });

  describe('findOne', () => {
    it('should return a profile by userId', async () => {
      const userId = '1';
      const expectedProfile = {
        id: 1,
        fullName: 'John Doe',
        userId: 1,
      };

      mockProfilesService.findOne.mockResolvedValue(expectedProfile);

      const result = await controller.findOne(userId);

      expect(result).toEqual(expectedProfile);
      expect(service.findOne).toHaveBeenCalledWith(+userId);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const updateProfileDto: UpdateProfileDto = {
        bio: 'Updated bio',
      };
      const req = { user: { id: 1 } };
      const expectedResult = {
        id: 1,
        fullName: 'John Doe',
        bio: 'Updated bio',
        userId: 1,
      };

      mockProfilesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(req, updateProfileDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(
        req.user.id,
        updateProfileDto,
      );
    });
  });
});
