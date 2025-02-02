import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

const createMockRepository = (): MockType<Repository<any>> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: MockType<Repository<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createDto = {
        title: 'Test Notification',
        message: 'Test Message',
        type: 'info' as const,
        userId: '123',
      };

      const notification = {
        id: '1',
        ...createDto,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create!.mockReturnValue(notification);
      repository.save!.mockResolvedValue(notification);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        read: false,
      });
      expect(repository.save).toHaveBeenCalledWith(notification);
      expect(result).toEqual(notification);
    });
  });

  describe('findAll', () => {
    it('should return an array of notifications', async () => {
      const notifications = [
        {
          id: '1',
          title: 'Test 1',
          message: 'Message 1',
          type: 'info',
          read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Test 2',
          message: 'Message 2',
          type: 'success',
          read: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      repository.find!.mockResolvedValue(notifications);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('should find a notification by id', async () => {
      const notification = {
        id: '1',
        title: 'Test',
        message: 'Message',
        type: 'info',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOneBy!.mockResolvedValue(notification);

      const result = await service.findOne('1');

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(notification);
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      const notification = {
        id: '1',
        title: 'Test',
        message: 'Message',
        type: 'info',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = { read: true };

      repository.findOneBy!.mockResolvedValue(notification);
      repository.merge!.mockReturnValue({ ...notification, ...updateDto });
      repository.save!.mockResolvedValue({ ...notification, ...updateDto });

      const result = await service.update('1', updateDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(repository.merge).toHaveBeenCalledWith(notification, updateDto);
      expect(repository.save).toHaveBeenCalled();
      if (result) {
        expect(result.read).toBe(true);
      }
    });

    it('should return null if notification not found', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      const result = await service.update('1', { read: true });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      const notification = {
        id: '1',
        title: 'Test',
        message: 'Message',
        type: 'info',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOneBy!.mockResolvedValue(notification);
      repository.remove!.mockResolvedValue(notification);

      const result = await service.remove('1');

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(repository.remove).toHaveBeenCalledWith(notification);
      expect(result).toEqual(notification);
    });

    it('should return null if notification not found', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      const result = await service.remove('1');

      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = {
        id: '1',
        title: 'Test',
        message: 'Message',
        type: 'info',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOneBy!.mockResolvedValue(notification);
      repository.merge!.mockReturnValue({ ...notification, read: true });
      repository.save!.mockResolvedValue({ ...notification, read: true });

      const result = await service.markAsRead('1');
      expect(result).toBeDefined();

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      if (result) {
        expect(result.read).toBe(true);
      }
    });
  });

  describe('findUnreadByUser', () => {
    it('should find unread notifications for a user', async () => {
      const notifications = [
        {
          id: '1',
          title: 'Test',
          message: 'Message',
          type: 'info',
          userId: '123',
          read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      repository.find!.mockResolvedValue(notifications);

      const result = await service.findUnreadByUser('123');

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          userId: '123',
          read: false,
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(notifications);
    });
  });
});
