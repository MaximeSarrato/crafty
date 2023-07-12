import { Injectable } from '@nestjs/common';
import { Message } from '../domain/message';

@Injectable()
export abstract class MessageRepository {
  abstract save(message: Message): Promise<void>;
  abstract getAllMessagesOfUser(user: string): Promise<Message[]>;
  abstract getById(messageId: string): Promise<Message>;
}
