import {makeActionCreator} from './utils';

export module modalActions {
  export const DISPLAY_MODAL = 'DISPLAY_MODAL';
  export const DISMISS_MODAL = 'DISMISS_MODAL';
  
  export const display = makeActionCreator(DISPLAY_MODAL, 'component');
  export const dismiss = makeActionCreator(DISMISS_MODAL);

}
