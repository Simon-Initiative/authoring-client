import * as Immutable from 'immutable';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { Message } from './message';
import { Title } from './title';

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
  title?: Title,
  style?: CommandStyle,
  commandType?: CommandType,
  message?: Message,
  guid?: string,
};

const defaultContent = {
  contentType: 'CommandLink',
  elementType: 'command',
  title: Title.fromText(''),
  target: '',
  style: CommandStyle.Link,
  commandType: CommandType.Message,
  message: new Message(),
  guid: '',
};

export class Command extends Immutable.Record(defaultContent) {

  contentType: 'CommandLink';
  elementType: 'command';
  target: string;
  style: CommandStyle;
  commandType: CommandType;
  message: Message;
  title: Title;
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
            title: Title.fromPersistence(item, id, notify),
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
        '#array': [this.title.toPersistence(), this.message.toPersistence()],
      },
    };
  }
}
