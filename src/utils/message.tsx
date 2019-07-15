
import { modalActions } from 'actions/modal';
import { ModalMessage } from 'utils/ModalMessage';

export function displayModalMessasge(dispatch, text: JSX.Element | string) {
  dispatch(modalActions.display(
    <ModalMessage onCancel={() => dispatch(modalActions.dismiss())}>
      {text}
    </ModalMessage>));
}
