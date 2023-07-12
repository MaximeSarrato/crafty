// import { DateProvider } from '@crafty/crafty/application/date-provider';
// import { TimelinePresenter } from '@crafty/crafty/application/timeline.presenter';
// import { Timeline } from '@crafty/crafty/domain/timeline';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class DefaultTimelinePresenter implements TimelinePresenter {
//   constructor(private readonly dateProvider: DateProvider) {}

//   present(
//     timeline: Timeline,
//   ): { author: string; text: string; publicationTime: string }[] {
//     const messages = timeline.data;
//     return messages.map((message) => ({
//       author: message.author,
//       text: message.text,
//       publicationTime: this.comptutePublicationTime(message.publishedAt),
//     }));
//   }

//   private comptutePublicationTime(publishedAt: Date) {
//     const diff = this.dateProvider.getNow().getTime() - publishedAt.getTime();
//     const minutes = Math.floor(diff / 60000);

//     if (minutes < 1) {
//       return 'less than a minute ago';
//     }

//     if (minutes < 2) {
//       return '1 minute ago';
//     }

//     return `${minutes} minutes ago`;
//   }
// }
