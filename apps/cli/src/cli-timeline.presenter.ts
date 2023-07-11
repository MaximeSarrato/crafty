import { TimelinePresenter } from '@crafty/crafty/application/timeline.presenter';
import { Timeline } from '@crafty/crafty/domain/timeline';
import { CustomConsoleLogger } from './custom.console.logger';
import { Injectable } from '@nestjs/common';
import { DefaultTimelinePresenter } from '@crafty/crafty/apps/timeline.default.presenter';

@Injectable()
export class CliTimelinePresenter implements TimelinePresenter {
  constructor(
    private readonly defaultTimelinePresenter: DefaultTimelinePresenter,
    private readonly logger: CustomConsoleLogger,
  ) {}

  present(timeline: Timeline): void {
    this.logger.table(this.defaultTimelinePresenter.present(timeline));
  }
}
