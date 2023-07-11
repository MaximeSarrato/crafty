import { Injectable } from '@nestjs/common';
import { FolloweesRepository } from '../followees.repository';

export type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

@Injectable()
export class FollowUserUseCase {
  constructor(private readonly followeesRepository: FolloweesRepository) {}

  async handle(followUserCommand: FollowUserCommand) {
    await this.followeesRepository.followUser({
      user: followUserCommand.user,
      followee: followUserCommand.userToFollow,
    });
  }
}
