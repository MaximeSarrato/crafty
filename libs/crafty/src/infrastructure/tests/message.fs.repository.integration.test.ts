import * as path from 'path';
import * as fs from 'fs';
import { FileSystemMessageRepository } from '../message.fs.repository';
import { messageBuilder } from '../../tests/message.builder';

const testMessagesPath = path.join(__dirname, './messages-test.json');

describe('FileSystemMessageRepository', () => {
  beforeEach(async () => {
    try {
      await fs.promises.writeFile(testMessagesPath, JSON.stringify([]));
    } catch (error) {
      // file might not exist
    }
  });

  test('save() can save a message in the filesystem', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);

    await messageRepository.save(
      messageBuilder()
        .withId('m1')
        .authoredBy('Alice')
        .withText('Test Message')
        .publishedAt(new Date('2023-02-16T14:54:00.000Z'))
        .build(),
    );

    const messagesData = await fs.promises.readFile(testMessagesPath);
    const messagesJSON = JSON.parse(messagesData.toString());
    expect(messagesJSON).toEqual([
      {
        id: 'm1',
        author: 'Alice',
        text: 'Test Message',
        publishedAt: '2023-02-16T14:54:00.000Z',
      },
    ]);
  });

  test('save() can update an existing message in the filesystem', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);

    await fs.promises.writeFile(
      testMessagesPath,
      JSON.stringify([
        {
          id: 'm1',
          author: 'Alice',
          text: 'Test Message',
          publishedAt: '2023-02-16T14:54:00.000Z',
        },
      ]),
    );

    await messageRepository.save(
      messageBuilder()
        .withId('m1')
        .authoredBy('Alice')
        .withText('Test Message Edited')
        .publishedAt(new Date('2023-02-16T14:54:00.000Z'))
        .build(),
    );

    const messagesData = await fs.promises.readFile(testMessagesPath);
    const messagesJSON = JSON.parse(messagesData.toString());
    expect(messagesJSON).toEqual([
      {
        id: 'm1',
        author: 'Alice',
        text: 'Test Message Edited',
        publishedAt: '2023-02-16T14:54:00.000Z',
      },
    ]);
  });

  test('getById returns a message by its id', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);

    await fs.promises.writeFile(
      testMessagesPath,
      JSON.stringify([
        {
          id: 'm1',
          author: 'Alice',
          text: 'Test Message',
          publishedAt: '2023-02-16T14:54:00.000Z',
        },
        {
          id: 'm2',
          author: 'Bob',
          text: 'Hello Message From Bob',
          publishedAt: '2023-02-16T14:55:00.000Z',
        },
      ]),
    );

    const bobMessage = await messageRepository.getById('m2');

    expect(bobMessage).toEqual(
      messageBuilder()
        .withId('m2')
        .authoredBy('Bob')
        .withText('Hello Message From Bob')
        .publishedAt(new Date('2023-02-16T14:55:00.000Z'))
        .build(),
    );
  });

  test('getAllMessagesOfUser returns all messages of a specific user', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagesPath);

    await fs.promises.writeFile(
      testMessagesPath,
      JSON.stringify([
        {
          id: 'm1',
          author: 'Alice',
          text: 'Test Message',
          publishedAt: '2023-02-16T14:54:00.000Z',
        },
        {
          id: 'm2',
          author: 'Bob',
          text: 'Hello Message From Bob',
          publishedAt: '2023-02-16T14:55:00.000Z',
        },
        {
          id: 'm3',
          author: 'Alice',
          text: 'Test Message 2',
          publishedAt: '2023-02-16T14:56:00.000Z',
        },
      ]),
    );

    const messagesOfAlice = await messageRepository.getAllMessagesOfUser(
      'Alice',
    );

    expect(messagesOfAlice).toHaveLength(2);
    expect(messagesOfAlice).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .withId('m3')
          .authoredBy('Alice')
          .withText('Test Message 2')
          .publishedAt(new Date('2023-02-16T14:56:00.000Z'))
          .build(),
        messageBuilder()
          .withId('m1')
          .authoredBy('Alice')
          .withText('Test Message')
          .publishedAt(new Date('2023-02-16T14:54:00.000Z'))
          .build(),
      ]),
    );
  });
});
