import { DateProvider } from '../application/date-provider.repository';

export class StubDateProvider implements DateProvider {
  now: Date;

  getNow(): Date {
    return this.now;
  }
}
