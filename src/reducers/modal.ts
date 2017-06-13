import { modalActions } from '../actions/modal';
import * as Immutable from 'immutable';
import { OtherAction } from './utils';

type ModalActions = 
  modalActions.dismissAction |
  modalActions.displayAction |
  OtherAction;

const defaultState = Immutable.Stack<any>();

export function modal(state = defaultState, action: ModalActions): Immutable.Stack<any> {
  switch (action.type) {
    case modalActions.DISMISS_MODAL:
      return state.pop();
    case modalActions.DISPLAY_MODAL:
      return state.push(action.component);
    default:
      return state;
  }
}
