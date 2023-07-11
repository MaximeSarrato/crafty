import { Injectable } from '@nestjs/common';
import { MessageEmptyError, MessageTooLongError } from '../../domain/message';
import { MessageRepository } from '../message.repository';
import { Err, Result, Ok } from '../result';

export type EditMessageCommand = {
  messageId: string;
  text: string;
};

@Injectable()
export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(
    editMessageCommand: EditMessageCommand,
  ): Promise<Result<void, MessageEmptyError | MessageTooLongError>> {
    const message = await this.messageRepository.getById(
      editMessageCommand.messageId,
    );

    try {
      message.editText(editMessageCommand.text);
    } catch (error) {
      return Err.of(error);
    }

    await this.messageRepository.save(message);

    return Ok.of(undefined);
  }
}
