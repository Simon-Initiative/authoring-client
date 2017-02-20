import { modalActions } from '../actions/modal';
import { OtherAction } from './utils';

type ModalActions = 
  modalActions.dismissAction |
  modalActions.displayAction |
  OtherAction

export function modal(state = null, action: ModalActions): Object[] {
  switch(action.type) {
  case modalActions.DISMISS_MODAL:
    return null;
  case modalActions.DISPLAY_MODAL:
    return action.component;
  default:
    return state;
  }
}