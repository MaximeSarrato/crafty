import * as fs from 'fs';
import * as path from 'path';
import { Message } from '../domain/message';
import { MessageRepository } from '../application/message.repository';

export class FileSystemMessageRepository implements MessageRepository {
  constructor(
    private readonly messagesPath = path.join(__dirname, 'messages.json'),
  ) {}

  async save(message: Message): Promise<void> {
    const messages = await this.getMessages();
    const existingMessageIndex = messages.findIndex(
      (msg) => msg.id === message.id,
    );

    if (existingMessageIndex === -1) {
      messages.push(message);
    } else {
      messages[existingMessageIndex] = message;
    }

    await fs.promises.writeFile(
      this.messagesPath,
      JSON.stringify(
        messages.map((message) => message.data),
        null,
        2,
      ),
    );
  }

  async getAllMessagesOfUser(user: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter((message) => message.author === user);
  }

  async getById(messageId: string): Promise<Message> {
    const allMessages = await this.getMessages();
    return allMessages.find((message) => message.id === messageId)!;
  }

  private async getMessages(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.messagesPath, 'utf-8');
    const messages = JSON.parse(data) as {
      id: string;
      text: string;
      author: string;
      publishedAt: string;
    }[];

    return messages.map((message) =>
      Message.fromData({
        id: message.id,
        text: message.text,
        author: message.author,
        publishedAt: new Date(message.publishedAt),
      }),
    );
  }
}
