
import { modalActions } from 'actions/modal';
import { ModalMessage } from 'utils/ModalMessage';

export function displayModalMessasge(dispatch, text: string) {
  dispatch(modalActions.display(
    <ModalMessage onCancel={() => dispatch(modalActions.dismiss())}>
      {text}
    </ModalMessage>));
}

export function displayModalElement(dispatch, element: JSX.Element) {
  dispatch(modalActions.display(
    <ModalMessage onCancel={() => dispatch(modalActions.dismiss())}>
      {element}
    </ModalMessage>
  ))
}