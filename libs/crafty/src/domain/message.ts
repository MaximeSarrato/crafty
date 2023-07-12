export class MessageTooLongError extends Error {}
export class MessageEmptyError extends Error {}

export class Message {
  constructor(
    private readonly _id: string,
    private readonly _author: string,
    private _text: MessageText,
    private readonly _publishedAt: Date,
  ) {}

  get id() {
    return this._id;
  }

  get author() {
    return this._author;
  }

  get text() {
    return this._text.value;
  }

  get publishedAt() {
    return this._publishedAt;
  }

  get data() {
    return {
      id: this._id,
      author: this._author,
      text: this._text.value,
      publishedAt: this._publishedAt,
    };
  }

  editText(text: string) {
    this._text = MessageText.of(text);
  }

  static fromData(data: Message['data']) {
    return new Message(
      data.id,
      data.author,
      MessageText.of(data.text),
      data.publishedAt,
    );
  }
}

export class MessageText {
  private constructor(readonly value: string) {}

  static of(text: string) {
    if (text.length > 280) {
      throw new MessageTooLongError();
    }
    if (text.trim().length === 0) {
      throw new MessageEmptyError();
    }

    return new MessageText(text);
  }
}
