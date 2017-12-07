import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment } from 'data/content/common';


export type MessageAction = {
  label: string,
  execute: (message, dispatch) => void;
};

export type DetailedMessagePayloadParams = {
  guid? : string,
  actions?: Immutable.List<MessageAction>;
  data?: Maybe<Object>;
  title?: string;
  message?: string;
};

const defaultContent = {
  guid: '',
  actions: Immutable.List<MessageAction>(),
  data: Maybe.nothing<Object>(),
  title: 'An error has occurred.',
  message: '',
};

export class DetailedMessagePayload extends Immutable.Record(defaultContent) {

  guid: string;
  actions: Immutable.List<MessageAction>;
  data: Maybe<Object>;
  title: string;
  message: string;

  constructor(params?: DetailedMessagePayloadParams) {
    super(augment(params));
  }

  with(values: DetailedMessagePayloadParams) {
    return this.merge(values) as this;
  }

}
