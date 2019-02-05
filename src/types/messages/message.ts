import * as Immutable from 'immutable';
import { augment } from 'data/content/common';

import { TitledContent } from './titled';

export enum Severity {
  Error = 'Error',
  Warning = 'Warning',
  Information = 'Information',
  Task = 'Task',
}

export enum Priority {
  Lowest,
  Low,
  Medium,
  High,
  Highest,
}

export enum Scope {
  Application,
  Package,
  Resource,
}

export enum ContentType {
  TitledContent = 'TitledContent',
}



export type MessageAction = {
  label: string,
  enabled: boolean,
  execute: (message: Message, dispatch) => void;
};

// As the application evolves, we can extend the messaging by
// defining additional payload types, but for now, there is just
// one payload type.
export type MessageContents = TitledContent;

export type MessageParams = {
  guid?: string,
  severity?: Severity;
  priority?: Priority;
  scope?: Scope;
  content?: MessageContents;
  actions?: Immutable.List<MessageAction>;
  canUserDismiss?: boolean;
};

const defaultContent = {
  guid: '',
  severity: Severity.Error,
  priority: Priority.Medium,
  scope: Scope.Resource,
  content: new TitledContent(),
  actions: Immutable.List<MessageAction>(),
  canUserDismiss: false,
};

export class Message extends Immutable.Record(defaultContent) {

  guid: string;
  severity: Severity;
  priority: Priority;
  scope: Scope;
  content: MessageContents;
  actions: Immutable.List<MessageAction>;
  canUserDismiss: boolean;

  constructor(params?: MessageParams) {
    super(augment(params));
  }

  with(values: MessageParams) {
    return this.merge(values) as this;
  }

}
