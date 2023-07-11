import { FastifyReply } from 'fastify';
import { TimelinePresenter } from '../application/timeline.presenter';
import { Timeline } from '../domain/timeline';

export class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}

  present(timeline: Timeline): void {
    this.reply.status(200).send(timeline.data);
  }
}
