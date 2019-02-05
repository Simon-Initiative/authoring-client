import * as Immutable from 'immutable';
import { augment } from 'data/content/common';

export type MessageParams = {
  text?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Message',
  elementType: 'message',
  guid: '',
  text: '',
};

export class Message extends Immutable.Record(defaultContent) {

  contentType: 'Message';
  elementType: 'message';
  text: string;
  guid: string;

  constructor(params?: MessageParams) {
    super(augment(params));
  }

  clone(): Message {
    return this;
  }

  with(values: MessageParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Message {

    const t = (root as any).message;
    const text = t['#text'] !== undefined ? t['#text'] : '';
    return new Message({ guid, text });
  }

  toPersistence(): Object {
    return {
      message: {
        '#text': this.text,
      },
    };
  }
}
