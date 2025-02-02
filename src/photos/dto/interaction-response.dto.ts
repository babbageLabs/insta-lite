export class PhotoInteractionDto {
  id: string;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
  comments: {
    id: string;
    content: string;
    userId: string;
    createdAt: Date;
  }[];
}
