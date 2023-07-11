import {
  FollowUserCommand,
  FollowUserUseCase,
} from '../application/usecases/follow-user.usecase';
import { InMemoryFolloweesRepository } from '../infrastructure/followees.inmemory.repository';

export const createFolloweesFixture = () => {
  const followeesRepository = new InMemoryFolloweesRepository();
  const followUserUseCase = new FollowUserUseCase(followeesRepository);

  return {
    givenUserFollowees({
      user,
      followees,
    }: {
      user: string;
      followees: string[];
    }) {
      followeesRepository.givenExistingFollowees({
        user,
        followees,
      });
    },
    async whenUserFollows(followUserCommand: FollowUserCommand) {
      await followUserUseCase.handle(followUserCommand);
    },
    async thenUserFolloweesAre({
      user,
      followees,
    }: {
      user: string;
      followees: string[];
    }) {
      const userFollowees = await followeesRepository.getFolloweesOf(user);
      expect(userFollowees).toEqual(followees);
    },
    followeesRepository,
  };
};

export type FolloweesFixture = ReturnType<typeof createFolloweesFixture>;
