import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('feed_items')
export class FeedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'photo_id' })
  photoId: string;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
