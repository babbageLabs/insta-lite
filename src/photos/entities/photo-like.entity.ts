import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Photo } from './photo.entity';

@Entity('photo_likes')
export class PhotoLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  photoId: string;

  @ManyToOne(() => Photo, (photo) => photo.likes)
  photo: Photo;

  @CreateDateColumn()
  createdAt: Date;
}
