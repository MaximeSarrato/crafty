import * as fs from 'fs';
import * as path from 'path';
import {
  Followee,
  FolloweesRepository,
} from '../application/followees.repository';

export class FileSystemFolloweesRepository implements FolloweesRepository {
  constructor(
    private readonly userFolloweesPath = path.join(
      __dirname,
      'user-followees.json'
    )
  ) {}

  async followUser(followee: Followee): Promise<void> {
    const allFollowees = await this.getAllUserFollowees();
    const actualUserFollowees = allFollowees[followee.user] ?? [];
    actualUserFollowees.push(followee.followee);
    allFollowees[followee.user] = actualUserFollowees;

    await fs.promises.writeFile(
      this.userFolloweesPath,
      JSON.stringify(allFollowees)
    );
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    const allFollowees = await this.getAllUserFollowees();
    const actualUserFollowees = allFollowees[user] ?? [];

    return actualUserFollowees;
  }

  private async getAllUserFollowees(): Promise<Record<string, string[]>> {
    const followeesData = await fs.promises.readFile(
      this.userFolloweesPath,
      'utf-8'
    );

    return JSON.parse(followeesData) as Record<string, string[]>;
  }
}
