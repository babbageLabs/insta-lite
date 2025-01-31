import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class FollowRepository {
    constructor(
        @InjectRepository(Follow)
        private readonly repository: Repository<Follow>,
    ) { }

    async createFollow(followerId: number, followingId: number): Promise<Follow> {
        const follow = this.repository.create({
            followerId,
            followingId,
        });
        return this.repository.save(follow);
    }

    async findFollow(
        followerId: number,
        followingId: number,
    ): Promise<Follow | null> {
        return this.repository.findOne({
            where: {
                followerId,
                followingId,
            },
        });
    }

    async removeFollow(followerId: number, followingId: number): Promise<void> {
        await this.repository.delete({
            followerId,
            followingId,
        });
    }

    async getFollowers(
        userId: number,
        limit: number = 20,
        offset: number = 0,
    ): Promise<[Follow[], number]> {
        return this.repository.findAndCount({
            where: { followingId: userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async getFollowing(
        userId: number,
        limit: number = 20,
        offset: number = 0,
    ): Promise<[Follow[], number]> {
        return this.repository.findAndCount({
            where: { followerId: userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async countFollowers(userId: number): Promise<number> {
        return this.repository.count({
            where: { followingId: userId },
        });
    }

    async countFollowing(userId: number): Promise<number> {
        return this.repository.count({
            where: { followerId: userId },
        });
    }

    async getFollowingIds(userId: number): Promise<number[]> {
        const follows = await this.repository.find({
            where: { followerId: userId },
            select: ['followingId'],
        });
        return follows.map((follow) => follow.followingId);
    }

    async getFollowerIds(userId: number): Promise<number[]> {
        const follows = await this.repository.find({
            where: { followingId: userId },
            select: ['followerId'],
        });
        return follows.map((follow) => follow.followerId);
    }
}
