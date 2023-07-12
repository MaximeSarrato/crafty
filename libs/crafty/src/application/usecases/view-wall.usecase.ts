import { Injectable } from '@nestjs/common';
import { Timeline } from '../../domain/timeline';
import { FolloweesRepository } from '../followees.repository';
import { MessageRepository } from '../message.repository';
import { TimelinePresenter } from '../timeline.presenter';

@Injectable()
export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeesRepository: FolloweesRepository,
  ) {}

  async handle(
    { user }: { user: string },
    timelinePresenter: TimelinePresenter,
  ): Promise<void> {
    const followees = await this.followeesRepository.getFolloweesOf(user);
    const messages = (
      await Promise.all(
        [user, ...followees].map((user) =>
          this.messageRepository.getAllMessagesOfUser(user),
        ),
      )
    ).flat();

    const timeline = new Timeline(messages);
    timelinePresenter.present(timeline);
  }
}
