import { TimelinePresenter } from '@crafty/crafty/application/timeline.presenter';
import { Timeline } from '@crafty/crafty/domain/timeline';
import { FastifyReply } from 'fastify';

export class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}

  present(timeline: Timeline): void {
    this.reply.status(200).send(timeline.data);
  }
}
