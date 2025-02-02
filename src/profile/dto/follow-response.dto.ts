export class FollowResponseDto {
  id: string;
  followerId: number;
  followingId: number;
  createdAt: Date;
  follower: {
    id: number;
    username: string;
    avatarUrl: string;
  };
  following: {
    id: number;
    username: string;
    avatarUrl: string;
  };
}

export class FollowStatsDto {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}
