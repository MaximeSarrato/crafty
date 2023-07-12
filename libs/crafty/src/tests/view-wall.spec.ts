import { FolloweesRepository } from '../application/followees.repository';
import { MessageRepository } from '../application/message.repository';
import { TimelinePresenter } from '../application/timeline.presenter';
import { ViewWallUseCase } from '../application/usecases/view-wall.usecase';
import { DefaultTimelinePresenter } from '../../../../apps/cli/src/default-timeline.presenter';
import { StubDateProvider } from '../infrastructure/stub-date.provider';
import { FolloweesFixture, createFolloweesFixture } from './followees.fixture';
import { messageBuilder } from './message.builder';
import { MessagingFixture, createMessagingFixture } from './messaging.fixture';

describe('Feature: Viewing user wall', () => {
  let fixture: Fixture;
  let messagingFixture: MessagingFixture;
  let followeesFixture: FolloweesFixture;

  beforeEach(() => {
    messagingFixture = createMessagingFixture();
    followeesFixture = createFolloweesFixture();
    fixture = createFixture({
      messageRepository: messagingFixture.messageRepository,
      followeeRepository: followeesFixture.followeesRepository,
    });
  });

  describe('Rule: All the messages from the user and her followees should appear in reverse chronogical order', () => {
    test("Charlie has subscribed to Alice's timeline", async () => {
      fixture.givenNowIs(new Date('2023-02-09T15:15:30.000Z'));
      messagingFixture.givenTheFollowingMessagesExist([
        messageBuilder()
          .authoredBy('Alice')
          .withId('m1')
          .withText('I love the weather today')
          .publishedAt(new Date('2023-02-09T15:00:30.000Z'))
          .build(),
        messageBuilder()
          .authoredBy('Bob')
          .withId('m2')
          .withText('Damn! We lost!')
          .publishedAt(new Date('2023-02-09T15:01:00.000Z'))
          .build(),
        messageBuilder()
          .authoredBy('Charlie')
          .withId('m3')
          .withText("I'm in New York today! Anyone wants to have a coffee?")
          .publishedAt(new Date('2023-02-09T15:15:00.000Z'))
          .build(),
      ]);
      followeesFixture.givenUserFollowees({
        user: 'Charlie',
        followees: ['Alice'],
      });
      await fixture.whenUserSeesTheWallOf('Charlie');

      fixture.thenUserShouldSee([
        {
          author: 'Charlie',
          text: "I'm in New York today! Anyone wants to have a coffee?",
          publicationTime: 'less than a minute ago',
        },
        {
          author: 'Alice',
          text: 'I love the weather today',
          publicationTime: '15 minutes ago',
        },
      ]);
    });
  });
});

const createFixture = ({
  messageRepository,
  followeeRepository,
}: {
  messageRepository: MessageRepository;
  followeeRepository: FolloweesRepository;
}) => {
  let wall: { author: string; text: string; publicationTime: string }[];

  const dateProvider = new StubDateProvider();
  const viewWallUseCase = new ViewWallUseCase(
    messageRepository,
    followeeRepository,
  );
  const defaultWallPresenter = new DefaultTimelinePresenter(dateProvider);
  const wallPresenter: TimelinePresenter = {
    present(theTimeline) {
      wall = defaultWallPresenter.present(theTimeline);
    },
  };
  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserSeesTheWallOf(user: string) {
      await viewWallUseCase.handle({ user }, wallPresenter);
    },
    thenUserShouldSee(
      expectedWall: { author: string; text: string; publicationTime: string }[],
    ) {
      expect(wall).toEqual(expectedWall);
    },
  };
};
type Fixture = ReturnType<typeof createFixture>;
