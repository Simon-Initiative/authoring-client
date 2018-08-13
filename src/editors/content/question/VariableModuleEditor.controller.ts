import { connect, Dispatch } from 'react-redux';
import { VariableModuleEditor } from './VariableModuleEditor';
import { modalActions } from 'actions/modal';
import { State } from 'reducers';

interface StateProps {

}

interface DispatchProps {
  displayModal: (component: any) => void;
  dismissModal: () => void;
}

interface OwnProps {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    displayModal: (component: any) => dispatch(modalActions.display(component)),
    dismissModal: () => dispatch(modalActions.dismiss()),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(VariableModuleEditor);

export { controller as VariableModuleEditor };
