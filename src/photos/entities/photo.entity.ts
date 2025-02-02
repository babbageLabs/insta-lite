import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PhotoLike } from './photo-like.entity';
import { PhotoComment } from './photo-comment.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalname: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column()
  url: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  hashtags: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @OneToMany(() => PhotoLike, (like) => like.photo)
  likes: PhotoLike[];

  @OneToMany(() => PhotoComment, (comment) => comment.photo)
  comments: PhotoComment[];
}
