import * as Immutable from 'immutable';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { Message } from './message';

const DEFAULT_TITLE = 'Go';

export enum CommandStyle {
  Link = 'link',
  Button = 'button',
}

export enum CommandType {
  Message = 'message',
  Broadcast = 'broadcast',
}


export type CommandParams = {
  target?: string,
  title?: string,
  style?: CommandStyle,
  commandType?: CommandType,
  message?: Message,
  guid?: string,
};

const defaultContent = {
  contentType: 'Command',
  elementType: 'command',
  title: DEFAULT_TITLE,
  target: '',
  style: CommandStyle.Link,
  commandType: CommandType.Message,
  message: new Message(),
  guid: '',
};

export class Command extends Immutable.Record(defaultContent) {

  contentType: 'Command';
  elementType: 'command';
  target: string;
  style: CommandStyle;
  commandType: CommandType;
  message: Message;
  title: string;
  guid: string;

  constructor(params?: CommandParams) {
    super(augment(params));
  }

  clone(): Command {
    return this;
  }

  with(values: CommandParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Command {

    const t = (root as any).command;

    let model = new Command({ guid });

    if (t['@target'] !== undefined) {
      model = model.with({ target: t['@target'] });
    }
    if (t['@style'] !== undefined) {
      model = model.with({ style: t['@style'] });
    }
    if (t['@type'] !== undefined) {
      model = model.with({ commandType: t['@type'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'title':
          model = model.with({
            title: item['title']['#text'] !== undefined ? item['title']['#text'] : DEFAULT_TITLE,
          });
          break;
        case 'message':
          model = model.with({ message: Message.fromPersistence(item, id, notify) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {
    return {
      command: {
        '@style': this.style,
        '@target': this.target,
        '@type': this.commandType,
        '#array': [{ title: { '#text': this.title } }, this.message.toPersistence()],
      },
    };
  }
}
