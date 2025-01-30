import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async create(
    userId: number,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    const profile = this.profileRepository.create({
      ...createProfileDto,
      userId,
    });
    return this.profileRepository.save(profile);
  }

  async findOne(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findOne(userId);

    Object.assign(profile, updateProfileDto);
    profile.updatedAt = new Date();

    return this.profileRepository.save(profile);
  }

  async incrementFollowers(userId: number): Promise<void> {
    await this.profileRepository.increment({ userId }, 'followersCount', 1);
  }

  async decrementFollowers(userId: number): Promise<void> {
    await this.profileRepository.decrement({ userId }, 'followersCount', 1);
  }

  async incrementFollowing(userId: number): Promise<void> {
    await this.profileRepository.increment({ userId }, 'followingCount', 1);
  }

  async decrementFollowing(userId: number): Promise<void> {
    await this.profileRepository.decrement({ userId }, 'followingCount', 1);
  }
}
