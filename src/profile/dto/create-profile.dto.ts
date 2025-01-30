import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateProfileDto {
    @IsString()
    @MaxLength(100)
    fullName: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    @IsOptional()
    location?: string;
}