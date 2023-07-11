import { Injectable } from '@nestjs/common';
import { Timeline } from '../domain/timeline';

@Injectable()
export abstract class TimelinePresenter {
  abstract present(timeline: Timeline): void;
}
