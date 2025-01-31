import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => String)
  cursor?: string;
}
