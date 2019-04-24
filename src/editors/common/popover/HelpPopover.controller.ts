import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { HelpPopover } from './HelpPopover';
import { modalActions } from 'actions/modal';

interface StateProps {

}

interface DispatchProps {
  displayModal: (component: any) => void;
  dismissModal: () => void;
}

interface OwnProps {
  activateOnClick?: boolean;
  modalTitle?: string;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    displayModal: component => dispatch(modalActions.display(component)),
    dismissModal: () => dispatch(modalActions.dismiss()),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(HelpPopover);

export { controller as HelpPopover };
