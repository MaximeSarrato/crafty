import { Timeline } from '../../domain/timeline';
import { MessageRepository } from '../message.repository';
import { TimelinePresenter } from '../timeline.presenter';

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(
    {
      user,
    }: {
      user: string;
    },
    timelinePresenter: TimelinePresenter
  ): Promise<void> {
    const messages = await this.messageRepository.getAllMessagesOfUser(user);

    const timeline = new Timeline(messages);

    return timelinePresenter.present(timeline);
  }
}
