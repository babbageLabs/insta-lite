import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      read: false,
    });
    return this.notificationsRepository.save(notification);
  }

  findAll() {
    return this.notificationsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.notificationsRepository.findOneBy({ id });
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) return null;

    this.notificationsRepository.merge(notification, updateNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async remove(id: string) {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) return null;

    return this.notificationsRepository.remove(notification);
  }

  async markAsRead(id: string) {
    return this.update(id, { read: true });
  }

  async markAllAsRead() {
    await this.notificationsRepository.update({}, { read: true });
    return this.findAll();
  }

  findUnreadByUser(userId: string) {
    return this.notificationsRepository.find({
      where: {
        userId,
        read: false,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
