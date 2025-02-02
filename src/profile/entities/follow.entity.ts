import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';

@Entity('follows')
@Unique(['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'follower_id' })
  followerId: number;

  @Column({ name: 'following_id' })
  followingId: number;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Profile, { eager: true })
  @JoinColumn({ name: 'follower_id' })
  follower: Profile;

  @ManyToOne(() => Profile, { eager: true })
  @JoinColumn({ name: 'following_id' })
  following: Profile;
}
