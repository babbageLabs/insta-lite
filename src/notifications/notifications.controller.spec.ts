import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  const mockNotification: Notification = {
    id: '1',
    title: 'Test Notification',
    message: 'Test Message',
    type: 'info',
    userId: 'user123',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      findUnreadByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('@Post()', () => {
    it('should create a notification', async () => {
      const createDto: CreateNotificationDto = {
        title: 'New Notification',
        message: 'Test Message',
        type: 'info',
        userId: 'user123',
      };

      service.create.mockResolvedValue({ ...mockNotification, ...createDto });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expect.objectContaining(createDto));
    });

    it('should throw an error if service fails', async () => {
      const createDto: CreateNotificationDto = {
        title: 'New Notification',
        message: 'Test Message',
        type: 'info',
        userId: 'user123',
      };

      service.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('@Get()', () => {
    it('should return all notifications', async () => {
      const notifications = [mockNotification];
      service.findAll.mockResolvedValue(notifications);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(notifications);
    });

    it('should return empty array when no notifications exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('@Get(unread)', () => {
    it('should return unread notifications for a user', async () => {
      const userId = 'user123';
      const unreadNotifications = [mockNotification];
      service.findUnreadByUser.mockResolvedValue(unreadNotifications);

      const result = await controller.findUnread(userId);

      expect(service.findUnreadByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(unreadNotifications);
    });

    it('should return empty array when no unread notifications exist', async () => {
      const userId = 'user123';
      service.findUnreadByUser.mockResolvedValue([]);

      const result = await controller.findUnread(userId);

      expect(service.findUnreadByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('@Get(:id)', () => {
    it('should return a notification by id', async () => {
      service.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockNotification);
    });

    it('should return null for non-existent notification', async () => {
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(service.findOne).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('@Patch(:id)', () => {
    it('should update a notification', async () => {
      const updateDto: UpdateNotificationDto = {
        title: 'Updated Title',
      };
      const updatedNotification = { ...mockNotification, ...updateDto };
      service.update.mockResolvedValue(updatedNotification);

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(updatedNotification);
    });

    it('should return null when updating non-existent notification', async () => {
      const updateDto: UpdateNotificationDto = {
        title: 'Updated Title',
      };
      service.update.mockResolvedValue(null);

      const result = await controller.update('999', updateDto);

      expect(service.update).toHaveBeenCalledWith('999', updateDto);
      expect(result).toBeNull();
    });
  });

  describe('@Delete(:id)', () => {
    it('should remove a notification', async () => {
      service.remove.mockResolvedValue(mockNotification);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockNotification);
    });

    it('should return null when removing non-existent notification', async () => {
      service.remove.mockResolvedValue(null);

      const result = await controller.remove('999');

      expect(service.remove).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('@Patch(:id/read)', () => {
    it('should mark a notification as read', async () => {
      const readNotification = { ...mockNotification, read: true };
      service.markAsRead.mockResolvedValue(readNotification);

      const result = await controller.markAsRead('1');

      expect(service.markAsRead).toHaveBeenCalledWith('1');
      expect(result).toEqual(readNotification);
      if (result) expect(result.read).toBe(true);
    });

    it('should return null when marking non-existent notification as read', async () => {
      service.markAsRead.mockResolvedValue(null);

      const result = await controller.markAsRead('999');

      expect(service.markAsRead).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('@Patch(mark-all-read)', () => {
    it('should mark all notifications as read', async () => {
      const readNotifications = [
        { ...mockNotification, read: true },
        { ...mockNotification, id: '2', read: true },
      ];
      service.markAllAsRead.mockResolvedValue(readNotifications);

      const result = await controller.markAllAsRead();

      expect(service.markAllAsRead).toHaveBeenCalled();
      expect(result).toEqual(readNotifications);
      expect(result.every((notification) => notification.read)).toBe(true);
    });

    it('should return empty array when no notifications exist', async () => {
      service.markAllAsRead.mockResolvedValue([]);

      const result = await controller.markAllAsRead();

      expect(service.markAllAsRead).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
