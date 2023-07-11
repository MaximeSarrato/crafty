#!/usr/bin/env node
import { Command } from 'commander';
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
import { TimelinePresenter } from '../application/timeline.presenter';
import { Timeline } from '../domain/timeline';
import { DefaultTimelinePresenter } from './timeline.default.presenter';
import { CliTimelinePresenter } from './cli-timeline.presenter';

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeesRepository = new PrismaFolloweeRepository(prismaClient);
const dateProvider = new RealDateProvider();

const cliTimelinePresenter = new CliTimelinePresenter(
  new DefaultTimelinePresenter(dateProvider)
);

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

const program = new Command();

program
  .version('1.0.0')
  .description('Crafty social network')
  .addCommand(
    new Command('post')
      .argument('<user>', 'the current user')
      .argument('<message>', 'the message to post')
      .action(async (user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: `${Math.floor(Math.random() * 10000)}`,
          author: user,
          text: message,
        };

        try {
          await postMessageUseCase.handle(postMessageCommand);
          console.log('✅ Message posté !');
          process.exit(0);
        } catch (error) {
          console.error('❌', error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('edit')
      .argument('<message-id>', 'the message id of the message to edit')
      .argument('<message>', 'the new text')
      .action(async (messageId, message) => {
        const editMessageCommand: EditMessageCommand = {
          messageId,
          text: message,
        };

        try {
          await editMessageUseCase.handle(editMessageCommand);
          console.log('✅ Message édité !');
          process.exit(0);
        } catch (error) {
          console.error('❌', error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('follow')
      .argument('<user>', 'the current user')
      .argument('<user-to-follow>', 'the user to follow')
      .action(async (user, userToFollow) => {
        try {
          const followUserCommand: FollowUserCommand = {
            user,
            userToFollow,
          };
          await followUserUseCase.handle(followUserCommand);
          console.log(`✅ User ${userToFollow} followed by ${user}!`);
          process.exit(0);
        } catch (error) {
          console.error('❌', error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('view')
      .argument('<user>', 'the user to view the timeline of')
      .action(async (user) => {
        try {
          const timeline = await viewTimelineUseCase.handle(
            { user },
            cliTimelinePresenter
          );
          console.table(timeline);
          process.exit(0);
        } catch (error) {
          console.error('❌', error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('wall')
      .argument('<user>', 'the user to view the wall of')
      .action(async (user) => {
        try {
          const wall = await viewWallUseCase.handle(
            { user },
            cliTimelinePresenter
          );
          console.table(wall);
          process.exit(0);
        } catch (error) {
          console.error('❌', error);
          process.exit(1);
        }
      })
  );

async function main() {
  await prismaClient.$connect();
  await program.parseAsync();
  await prismaClient.$disconnect();
}

main();
