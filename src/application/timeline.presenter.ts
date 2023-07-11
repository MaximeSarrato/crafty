import { Timeline } from '../domain/timeline';

export interface TimelinePresenter {
  present(timeline: Timeline): void;
}
