import { Clipboard } from 'types/clipboard';
import {
  CutAction,
  CUT,
  CopyAction,
  COPY,
} from 'actions/clipboard';
import { OtherAction } from './utils';

export type ActionTypes = CutAction | CopyAction;
export type ClipboardState = Clipboard;

const initialState = new Clipboard();

export const example = (
  state: ClipboardState = initialState,
  action: ActionTypes,
): ClipboardState => {
  switch (action.type) {
    case CUT:
      return state;
    case COPY:
      return state;
    default:
      return state;
  }
};
