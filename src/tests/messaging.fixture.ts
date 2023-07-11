import {
  PostMessageUseCase,
  PostMessageCommand,
} from '../application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase';
import { StubDateProvider } from '../infrastructure/stub-date.provider';
import { InMemoryMessageRepository } from '../infrastructure/message.inmemory.repository';
import { Message } from '../domain/message';
import {
  EditMessageUseCase,
  EditMessageCommand,
} from '../application/usecases/edit-message.usecase';
import { DefaultTimelinePresenter } from '../apps/timeline.default.presenter';
import { TimelinePresenter } from '../application/timeline.presenter';

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();

  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
  const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
  const timelinePresenter: TimelinePresenter = {
    present(theTimeline) {
      timeline = defaultTimelinePresenter.present(theTimeline);
    },
  };

  let timeline: { author: string; text: string; publicationTime: string }[];

  let thrownError: Error;

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    async whenUserSeesTheTimeLineOf(user: string) {
      await viewTimelineUseCase.handle({ user }, timelinePresenter);
    },

    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[]
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const message = await messageRepository.getById(expectedMessage.id);
      expect(expectedMessage).toEqual(message);
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
    messageRepository,
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
