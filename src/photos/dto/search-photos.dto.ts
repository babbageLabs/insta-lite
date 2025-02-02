import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class SearchPhotosDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 20;
}

export class SearchPhotosResponseDto {
  items: {
    id: string;
    filename: string;
    originalname: string;
    url: string;
    description: string;
    hashtags: string[];
    uploadedAt: Date;
    user: {
      id: string;
      username: string;
    };
    _count: {
      likes: number;
      comments: number;
    };
  }[];
  total: number;
  page: number;
  totalPages: number;
}
