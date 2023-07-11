import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CraftyModule } from '@crafty/crafty';
import { PrismaFolloweeRepository } from '@crafty/crafty/infrastructure/prisma/followee.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infrastructure/prisma/message.prisma.repository';
import { PrismaService } from '@crafty/crafty/infrastructure/prisma/prisma.service';
import { RealDateProvider } from '@crafty/crafty/infrastructure/real-date.provider';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FolloweesRepository: PrismaFolloweeRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
