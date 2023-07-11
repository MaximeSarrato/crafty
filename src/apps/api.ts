#!/usr/bin/env node
import Fastify, { FastifyInstance } from 'fastify';
import * as httpErrors from 'http-errors';
import { PrismaClient } from '@prisma/client';
import {
  EditMessageUseCase,
  EditMessageCommand,
} from '../application/usecases/edit-message.usecase';
import {
  PostMessageUseCase,
  PostMessageCommand,
} from '../application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase';
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '../application/usecases/follow-user.usecase';
import { ViewWallUseCase } from '../application/usecases/view-wall.usecase';
import { RealDateProvider } from '../infrastructure/real-date.provider';
import { PrismaMessageRepository } from '../infrastructure/prisma/message.prisma.repository';
import { PrismaFolloweeRepository } from '../infrastructure/prisma/followee.prisma.repository';
import { ApiTimelinePresenter } from './api-timeline.presenter';

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeesRepository = new PrismaFolloweeRepository(prismaClient);
const dateProvider = new RealDateProvider();

const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
const viewWallUseCase = new ViewWallUseCase(
  messageRepository,
  followeesRepository
);
const followUserUseCase = new FollowUserUseCase(followeesRepository);

const fastify = Fastify({ logger: true });

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string; message: string } }>(
    '/post',
    {},
    async (request, reply) => {
      const postMessageCommand: PostMessageCommand = {
        id: `${Math.floor(Math.random() * 10000)}`,
        author: request.body.user,
        text: request.body.message,
      };

      try {
        const result = await postMessageUseCase.handle(postMessageCommand);
        if (result.isOk()) {
          reply.status(201);
        } else {
          reply.send(httpErrors[403](result.error));
        }
      } catch (error) {
        reply.send(httpErrors[500](error));
      }
    }
  );

  fastifyInstance.post<{
    Body: { messageId: string; message: string };
  }>('/edit', {}, async (request, reply) => {
    const editMessageCommand: EditMessageCommand = {
      messageId: request.body.messageId,
      text: request.body.message,
    };

    try {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isOk()) {
        reply.status(200);
      } else {
        reply.send(httpErrors[403](result.error));
      }
    } catch (error) {
      reply.send(httpErrors[500](error));
    }
  });

  fastifyInstance.post<{
    Body: { user: string; followee: string };
  }>('/follow', {}, async (request, reply) => {
    const followUserCommand: FollowUserCommand = {
      user: request.body.user,
      userToFollow: request.body.followee,
    };

    try {
      await followUserUseCase.handle(followUserCommand);
      reply.status(201);
    } catch (error) {
      reply.send(httpErrors[500](error));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply:
      | { author: string; text: string; publicationTime: string }[]
      | httpErrors.HttpError<500>;
  }>('/view', {}, async (request, reply) => {
    try {
      const timelinePresenter = new ApiTimelinePresenter(reply);
      await viewTimelineUseCase.handle(
        {
          user: request.query.user,
        },
        timelinePresenter
      );
    } catch (error) {
      reply.send(httpErrors[500](error));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply:
      | { author: string; text: string; publicationTime: string }[]
      | httpErrors.HttpError<500>;
  }>('/wall', {}, async (request, reply) => {
    try {
      const timelinePresenter = new ApiTimelinePresenter(reply);
      await viewWallUseCase.handle(
        { user: request.query.user },
        timelinePresenter
      );
    } catch (error) {
      reply.send(httpErrors[500](error));
    }
  });
};

fastify.register(routes);
fastify.addHook('onClose', async () => {
  await prismaClient.$disconnect();
});

async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

main();
