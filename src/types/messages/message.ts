import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment } from 'data/content/common';

import { DetailedMessagePayload } from './detailed';

export enum Severity {
  Error = 'Error',
  Warning = 'Warning',
  Information = 'Information',
}

export enum Scope {
  Application,
  Package,
  Resource,
}

export enum PayloadType {
  DetailedMessage = 'DetailedMessage',
}

// As the application evolves, we can extend the messaging by
// defining additional payload types, but for now, there is just
// one payload type.
export type Payload = DetailedMessagePayload;

export type MessageParams = {
  guid? : string,
  severity?: Severity;
  scope?: Scope;
  payload: Payload;
  canUserDismiss?: boolean;
};

const defaultContent = {
  guid: '',
  severity: Severity.Error,
  scope: Scope.Resource,
  payload: new DetailedMessagePayload(),
  canUserDismiss: false,
};

export class Message extends Immutable.Record(defaultContent) {

  guid: string;
  severity: Severity;
  scope: Scope;
  payload: Payload;
  canUserDismiss: boolean;

  constructor(params?: MessageParams) {
    super(augment(params));
  }

  with(values: MessageParams) {
    return this.merge(values) as this;
  }

}
