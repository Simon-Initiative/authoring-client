import { modalActions } from '../actions/modal';
import * as Immutable from 'immutable';
import { OtherAction } from './utils';

type ModalActions =
  modalActions.dismissAction |
  modalActions.displayAction |
  OtherAction;

export type ModalState = Immutable.Stack<any>;

const defaultState = Immutable.Stack<any>();

export function modal(
  state: ModalState = defaultState,
  action: ModalActions,
): ModalState {
  switch (action.type) {
    case modalActions.DISMISS_MODAL:
      return state.pop();
    case modalActions.DISPLAY_MODAL:
      console.log('Modal Component', action.component);
      console.log('State with component', state.push(action.component));
      return state.push(action.component);
    default:
      return state;
  }
}
