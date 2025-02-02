import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  avatarUrl: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 0 })
  followersCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;
}
