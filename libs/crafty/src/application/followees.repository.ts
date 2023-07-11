import { Injectable } from '@nestjs/common';

export type Followee = {
  user: string;
  followee: string;
};

@Injectable()
export abstract class FolloweesRepository {
  abstract followUser(followee: Followee): Promise<void>;
  abstract getFolloweesOf(user: string): Promise<string[]>;
}
