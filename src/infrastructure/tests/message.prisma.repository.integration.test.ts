import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from 'testcontainers';
import { PrismaMessageRepository } from '../prisma/message.prisma.repository';
import { messageBuilder } from '../../tests/message.builder';

describe('PrismaMessageRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

  const asyncExec = promisify(exec);

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty-test')
      .withUsername('crafty-test')
      .withPassword('crafty-test')
      .withExposedPorts(5432)
      .start();

    const databaseUrl = `postgresql://crafty-test:crafty-test@${container.getHost()}:${container.getMappedPort(
      5432
    )}/crafty-test?schema=public`;

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop();
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  test('save() should save a new message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    await messageRepository.save(
      messageBuilder()
        .authoredBy('Alice')
        .withId('message-id')
        .withText('Hello, World!')
        .publishedAt(new Date('2023-02-09T15:50:00Z'))
        .build()
    );

    await messageRepository.save(
      messageBuilder()
        .authoredBy('Alice')
        .withId('message-id')
        .withText('Hello, World!')
        .publishedAt(new Date('2023-02-09T15:50:00Z'))
        .build()
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: 'message-id',
      },
    });

    expect(expectedMessage).toEqual({
      id: 'message-id',
      text: 'Hello, World!',
      authorId: 'Alice',
      publishedAt: new Date('2023-02-09T15:50:00Z'),
    });
  });

  test('save() should update an existing message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const aliceMessageBuilder = messageBuilder()
      .authoredBy('Alice')
      .withId('message-id')
      .withText('Hello, World!')
      .publishedAt(new Date('2023-02-09T15:50:00Z'));

    await messageRepository.save(aliceMessageBuilder.build());

    await messageRepository.save(
      aliceMessageBuilder.withText('Hello, World! 2').build()
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: 'message-id',
      },
    });

    expect(expectedMessage).toEqual({
      id: 'message-id',
      text: 'Hello, World! 2',
      authorId: 'Alice',
      publishedAt: new Date('2023-02-09T15:50:00Z'),
    });
  });

  test('getById() should return a message by its id', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const aliceMessage = messageBuilder()
      .authoredBy('Alice')
      .withId('message-id')
      .withText('Hello, World!')
      .publishedAt(new Date('2023-02-09T15:50:00Z'))
      .build();

    await messageRepository.save(aliceMessage);

    const retrievedMessage = await messageRepository.getById('message-id');

    expect(retrievedMessage).toEqual(aliceMessage);
  });

  test('getAllMessagesOfUser() should return all user messages', () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const aliceMessage = messageBuilder()
      .authoredBy('Alice')
      .withId('message-id')
      .withText('Hello, World!')
      .publishedAt(new Date('2023-02-09T15:50:00Z'))
      .build();
  });
});
