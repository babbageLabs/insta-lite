import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error'])
  type?: 'info' | 'success' | 'warning' | 'error';

  @IsOptional()
  @IsUUID()
  userId?: string;
}
