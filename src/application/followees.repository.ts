export type Followee = {
  user: string;
  followee: string;
};

export interface FolloweesRepository {
  followUser(followee: Followee): Promise<void>;
  getFolloweesOf(user: string): Promise<string[]>;
}
