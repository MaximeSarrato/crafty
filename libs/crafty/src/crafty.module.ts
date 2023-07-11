import { ClassProvider, DynamicModule, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DateProvider } from './application/date-provider';
import { FolloweesRepository } from './application/followees.repository';
import { MessageRepository } from './application/message.repository';
import { EditMessageUseCase } from './application/usecases/edit-message.usecase';
import { FollowUserUseCase } from './application/usecases/follow-user.usecase';
import { PostMessageUseCase } from './application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from './application/usecases/view-timeline.usecase';
import { ViewWallUseCase } from './application/usecases/view-wall.usecase';
import { DefaultTimelinePresenter } from './apps/timeline.default.presenter';

@Module({})
export class CraftyModule {
  static register(providers: {
    MessageRepository: ClassProvider<MessageRepository>['useClass'];
    FolloweesRepository: ClassProvider<FolloweesRepository>['useClass'];
    DateProvider: ClassProvider<DateProvider>['useClass'];
    PrismaClient: ClassProvider<PrismaClient>['useClass'];
  }): DynamicModule {
    return {
      module: CraftyModule,
      providers: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
        {
          provide: MessageRepository,
          useClass: providers.MessageRepository,
        },
        {
          provide: FolloweesRepository,
          useClass: providers.FolloweesRepository,
        },
        {
          provide: DateProvider,
          useClass: providers.DateProvider,
        },
        {
          provide: PrismaClient,
          useClass: providers.PrismaClient,
        },
      ],
      exports: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
        DateProvider,
      ],
    };
  }
}
