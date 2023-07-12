import { MessageTooLongError, MessageEmptyError } from '../domain/message';
import { messageBuilder } from './message.builder';
import { MessagingFixture, createMessagingFixture } from './messaging.fixture';

describe('Feature: Posting a message', () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe('Rule: A message can contain a maximum of 280 characters', () => {
    test('Alice can post a message on her timeline', async () => {
      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      await fixture.whenUserPostsAMessage({
        id: 'message-id',
        text: 'Hello World',
        author: 'Alice',
      });

      await fixture.thenMessageShouldBe(
        messageBuilder()
          .withText('Hello World')
          .authoredBy('Alice')
          .publishedAt(new Date('2023-01-19T19:00:00.000Z'))
          .build(),
      );
    });

    test('Alice cannot post a message with more than 280 characters', async () => {
      const textWithLengthOf281Characters = 'a'.repeat(281);

      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      await fixture.whenUserPostsAMessage({
        id: 'message-id',
        author: 'Alice',
        text: textWithLengthOf281Characters,
      });

      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });

  describe('Rule: A message cannot be empty', () => {
    test('Alice cannot post a message with an empty text', async () => {
      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      await fixture.whenUserPostsAMessage({
        id: 'message-id',
        author: 'Alice',
        text: '',
      });

      fixture.thenErrorShouldBe(MessageEmptyError);
    });

    test('Alice cannot post a message with only whitespaces', async () => {
      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      await fixture.whenUserPostsAMessage({
        id: 'message-id',
        author: 'Alice',
        text: '                      ',
      });

      fixture.thenErrorShouldBe(MessageEmptyError);
    });
  });
});
