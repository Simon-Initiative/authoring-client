import * as Immutable from 'immutable';
import * as Messages from 'types/messages';

import {
  ShowMessageAction,
  DismissScopedMessages,
  DismissSpecificMessageAction,
  SHOW_MESSAGE,
  DISMISS_SCOPED_MESSAGES,
  DISMISS_SPECIFIC_MESSAGE,
} from 'actions/messages';

import { OtherAction } from './utils';

export type MessageAction =
  ShowMessageAction |
  DismissScopedMessages |
  DismissSpecificMessageAction |
  OtherAction;

export type MessageState = Immutable.OrderedMap<string, Messages.Message>;

const initialState: MessageState = Immutable.OrderedMap<string, Messages.Message>();

export const messages = (
  state: MessageState = initialState,
  action: MessageAction,
) : MessageState => {
  switch (action.type) {
    case SHOW_MESSAGE:
      return state.set(action.message.guid, action.message);
    case DISMISS_SPECIFIC_MESSAGE:
      return state.delete(action.message.guid);
    case DISMISS_SCOPED_MESSAGES:
      return state.filter(m => m.scope < action.scope).toOrderedMap();
    default:
      return state;
  }
};
