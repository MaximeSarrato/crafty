import { Message } from './message';

export class Timeline {
  constructor(private readonly messages: Message[]) {}

  get data() {
    this.messages.sort(
      (messageA, messageB) =>
        messageB.publishedAt.getTime() - messageA.publishedAt.getTime(),
    );

    return this.messages.map((message) => message.data);
  }
}
