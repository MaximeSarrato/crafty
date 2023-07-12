import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { exec } from 'child_process';
import { ApiModule } from '../src/api.module';
import { DateProvider } from '@crafty/crafty/application/date-provider';
import { StubDateProvider } from '@crafty/crafty/infrastructure/stub-date.provider';
import { PrismaClient } from '@prisma/client';
import { CliModule } from 'apps/cli/src/cli.module';
import {
  StartedPostgreSqlContainer,
  PostgreSqlContainer,
} from 'testcontainers';
import { promisify } from 'util';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/prisma/message.prisma.repository';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';
import { PrismaFolloweeRepository } from '@crafty/crafty/infrastructure/prisma/followee.prisma.repository';

const asyncExec = promisify(exec);

describe('Api (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let commandInstance: TestingModule;
  const now = new Date('2023-02-14T19:00:00.000Z');
  const stubDateProvider = new StubDateProvider();
  stubDateProvider.now = now;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty')
      .withUsername('crafty')
      .withPassword('crafty')
      .withExposedPorts(5432)
      .start();
    const databaseUrl = `postgresql://crafty:crafty@${container.getHost()}:${container.getMappedPort(
      5432,
    )}/crafty?schema=public`;
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
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    })
      .overrideProvider(DateProvider)
      .useValue(stubDateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/post (POST)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await request(app.getHttpServer())
      .post('/post')
      .send({ user: 'Alice', message: 'Message from api test' })
      .expect(201);

    const aliceMessages = await messageRepository.getAllMessagesOfUser('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message from api test',
      publishedAt: now,
    });
  });

  it('/edit (POST)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withId('m1')
        .authoredBy('Alice')
        .withText('Hello, Word!')
        .publishedAt(now)
        .build(),
    );

    await request(app.getHttpServer())
      .post('/edit')
      .send({ messageId: 'm1', message: 'Message from api test' })
      .expect(200);

    const aliceMessages = await messageRepository.getAllMessagesOfUser('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: 'm1',
      author: 'Alice',
      text: 'Message from api test',
      publishedAt: now,
    });
  });

  it('/follow (POST)', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    await request(app.getHttpServer())
      .post('/follow')
      .send({ user: 'Alice', followee: 'Bob' })
      .expect(201);

    const aliceFollowees = await followeeRepository.getFolloweesOf('Alice');
    expect(aliceFollowees).toEqual(['Bob']);
  });

  it('/view (GET)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .authoredBy('Alice')
        .withId('alice-msg-id')
        .publishedAt(now)
        .withText('Message from api test')
        .build(),
    );

    await request(app.getHttpServer())
      .get('/view')
      .query({ user: 'Alice' })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([
          {
            id: expect.any(String),
            author: 'Alice',
            text: 'Message from api test',
            publishedAt: now.toISOString(),
          },
        ]);
      });

    const aliceMessages = await messageRepository.getAllMessagesOfUser('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message from api test',
      publishedAt: now,
    });
  });

  it('/wall (GET)', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    await followeeRepository.followUser({ user: 'Alice', followee: 'Bob' });
    await messageRepository.save(
      messageBuilder()
        .authoredBy('Alice')
        .withId('alice-msg-id')
        .publishedAt(now)
        .withText('Message from api test')
        .build(),
    );
    await messageRepository.save(
      messageBuilder()
        .authoredBy('Bob')
        .withId('bob-msg-id')
        .publishedAt(new Date('2023-02-14T19:01:00.000Z'))
        .withText('Hey, I am Bob!')
        .build(),
    );

    await request(app.getHttpServer())
      .get('/wall')
      .query({ user: 'Alice' })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([
          {
            id: 'bob-msg-id',
            author: 'Bob',
            text: 'Hey, I am Bob!',
            publishedAt: new Date('2023-02-14T19:01:00.000Z').toISOString(),
          },
          {
            id: 'alice-msg-id',
            author: 'Alice',
            text: 'Message from api test',
            publishedAt: now.toISOString(),
          },
        ]);
      });

    const aliceMessages = await messageRepository.getAllMessagesOfUser('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String),
      author: 'Alice',
      text: 'Message from api test',
      publishedAt: now,
    });
  });
});
