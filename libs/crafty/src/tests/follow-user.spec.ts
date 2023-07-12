import { FolloweesFixture, createFolloweesFixture } from './followees.fixture';

describe('Feature: Following a user', () => {
  let fixture: FolloweesFixture;

  beforeEach(() => {
    fixture = createFolloweesFixture();
  });

  test('Alice can follow Bob', async () => {
    fixture.givenUserFollowees({
      user: 'Alice',
      followees: ['Charlie'],
    });

    await fixture.whenUserFollows({
      user: 'Alice',
      userToFollow: 'Bob',
    });

    await fixture.thenUserFolloweesAre({
      user: 'Alice',
      followees: ['Charlie', 'Bob'],
    });
  });
});
