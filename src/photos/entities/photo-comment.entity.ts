import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Photo } from './photo.entity';

@Entity('photo_comments')
export class PhotoComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  photoId: string;

  @Column()
  content: string;

  @ManyToOne(() => Photo, (photo) => photo.comments)
  photo: Photo;

  @CreateDateColumn()
  createdAt: Date;
}
