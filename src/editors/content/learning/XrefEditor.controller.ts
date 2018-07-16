import { connect, Dispatch } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { State } from 'reducers';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor';
import XrefEditor from 'editors/content/learning/XrefEditor';
import { modalActions } from 'actions/modal';

interface StateProps {

}

interface DispatchProps {
  displayModal: (component: any) => void;
  dismissModal: () => void;
}

interface OwnProps extends AbstractContentEditorProps<contentTypes.Xref> {
  onShowSidebar: () => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    clipboard: state.clipboard,
    course: state.course,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>): DispatchProps => {
  return {
    displayModal: component => dispatch(modalActions.display(component)),
    dismissModal: () => dispatch(modalActions.dismiss()),
  };
};

const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(XrefEditor);

export { controller as XrefEditor };
