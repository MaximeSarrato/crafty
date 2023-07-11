import {
  Followee,
  FolloweesRepository,
} from '../application/followees.repository';

export class InMemoryFolloweesRepository implements FolloweesRepository {
  private userFollowees: Map<string, string[]> = new Map();

  givenExistingFollowees({
    user,
    followees,
  }: {
    user: string;
    followees: string[];
  }) {
    this.userFollowees.set(user, followees);
  }

  followUser(followee: Followee) {
    const existingFollowees = this.userFollowees.get(followee.user) ?? [];
    existingFollowees.push(followee.followee);
    this.userFollowees.set(followee.user, existingFollowees);
    return Promise.resolve();
  }

  getFolloweesOf(user: string) {
    return Promise.resolve(this.userFollowees.get(user) ?? []);
  }
}
