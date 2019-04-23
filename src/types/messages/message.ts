import * as Immutable from 'immutable';
import guid from 'utils/guid';

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
  PackageDetails,
  CoursePackage,
  Organization,
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
  guid: string,
  severity: Severity;
  priority: Priority;
  scope: Scope;
  content: MessageContents;
  actions: Immutable.List<MessageAction>;
  canUserDismiss: boolean;
};

const defaults = (params: Partial<MessageParams> = {}) => ({
  guid: params.guid || guid(),
  severity: params.severity || Severity.Error,
  priority: params.priority || Priority.Medium,
  scope: params.scope || Scope.Resource,
  content: params.content || new TitledContent(),
  actions: params.actions || Immutable.List<MessageAction>(),
  canUserDismiss: params.canUserDismiss || false,
});

export class Message extends Immutable.Record(defaults()) {

  guid: string;
  severity: Severity;
  priority: Priority;
  scope: Scope;
  content: MessageContents;
  actions: Immutable.List<MessageAction>;
  canUserDismiss: boolean;

  constructor(params?: Partial<MessageParams>) {
    super(defaults(params));
  }

  with(values: Partial<MessageParams>) {
    return this.merge(values) as this;
  }

}
