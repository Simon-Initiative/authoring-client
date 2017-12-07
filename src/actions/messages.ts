import * as Messages from 'types/messages';

export type SHOW_MESSAGE = 'SHOW_MESSAGE';
export const SHOW_MESSAGE = 'SHOW_MESSAGE';

export type DISMISS_SPECIFIC_MESSAGE = 'DISMISS_SPECIFIC_MESSAGE';
export const DISMISS_SPECIFIC_MESSAGE : DISMISS_SPECIFIC_MESSAGE = 'DISMISS_SPECIFIC_MESSAGE';

export type DISMISS_SCOPED_MESSAGES = 'DISMISS_SCOPED_MESSAGES';
export const DISMISS_SCOPED_MESSAGES : DISMISS_SCOPED_MESSAGES = 'DISMISS_SCOPED_MESSAGES';

export type ShowMessageAction = {
  type: SHOW_MESSAGE,
  message: Messages.Message,
};

export function showMessage(message: Messages.Message) : ShowMessageAction {
  return {
    type: SHOW_MESSAGE,
    message,
  };
}

export type DismissSpecificMessageAction = {
  type: DISMISS_SPECIFIC_MESSAGE,
  message: Messages.Message,
};

export function dismissSpecificMessage(message: Messages.Message) : DismissSpecificMessageAction {
  return {
    type: DISMISS_SPECIFIC_MESSAGE,
    message,
  };
}

export type DismissScopedMessages = {
  type: DISMISS_SCOPED_MESSAGES,
  scope: Messages.Scope,
};

export function dismissScopedMessages(scope: Messages.Scope) : DismissScopedMessages {
  return {
    type: DISMISS_SCOPED_MESSAGES,
    scope,
  };
}

