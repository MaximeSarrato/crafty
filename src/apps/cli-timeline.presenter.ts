import { DateProvider } from '../application/date-provider.repository';
import { TimelinePresenter } from '../application/timeline.presenter';
import { Timeline } from '../domain/timeline';
import { DefaultTimelinePresenter } from './timeline.default.presenter';

export class CliTimelinePresenter implements TimelinePresenter {
  constructor(
    private readonly defaultTimelinePresenter: DefaultTimelinePresenter
  ) {}

  present(timeline: Timeline): void {
    console.table(this.defaultTimelinePresenter.present(timeline));
  }
}
