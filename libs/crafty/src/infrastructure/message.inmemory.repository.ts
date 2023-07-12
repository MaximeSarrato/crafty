import { Message } from '../domain/message';
import { MessageRepository } from '../application/message.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryMessageRepository implements MessageRepository {
  messages = new Map<string, Message>();

  async save(message: Message): Promise<void> {
    this._save(message);
  }

  getById(messageId: string): Promise<Message> {
    return Promise.resolve(this.messages.get(messageId)!);
  }

  givenExistingMessages(messages: Message[]): void {
    messages.forEach(this._save.bind(this));
  }

  getAllMessagesOfUser(user: string): Promise<Message[]> {
    return Promise.resolve(
      [...this.messages.values()]
        .filter((message) => message.author === user)
        // This is a workaround to avoid mutating the original messages
        .map((message) =>
          Message.fromData({
            id: message.id,
            text: message.text,
            author: message.author,
            publishedAt: message.publishedAt,
          }),
        ),
    );
  }

  private _save(message: Message): void {
    this.messages.set(message.id, message);
  }
}
