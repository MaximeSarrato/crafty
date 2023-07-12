import { CraftyModule } from '@crafty/crafty';
import { PrismaFolloweeRepository } from '@crafty/crafty/infrastructure/prisma/followee.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/prisma/message.prisma.repository';
import { RealDateProvider } from '@crafty/crafty/infrastructure/real-date.provider';
import { Module } from '@nestjs/common';
import { commands } from './commands';
import { CliTimelinePresenter } from './cli-timeline.presenter';
import { CustomConsoleLogger } from './custom.console.logger';
import { PrismaService } from '@crafty/crafty/infrastructure/prisma/prisma.service';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FolloweesRepository: PrismaFolloweeRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  providers: [...commands, CliTimelinePresenter, CustomConsoleLogger],
})
export class CliModule {}
