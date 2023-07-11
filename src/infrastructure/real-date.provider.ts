import { DateProvider } from '../application/date-provider.repository';

export class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}
