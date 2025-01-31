export class FollowResponseDto {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  following: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export class FollowStatsDto {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}
