import { connect, Dispatch } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { State } from 'reducers';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor';
import XrefEditor from 'editors/content/learning/XrefEditor';
import { modalActions } from 'actions/modal';
import { Clipboard } from 'types/clipboard';
import { CourseModel } from 'data/models';
import { ContentElement } from 'data/content/common/interfaces';
import { fetchAndSetTargetNode, MissingTargetId } from 'actions/xref';
import { Either } from 'tsmonad';

interface StateProps {
  clipboard: Clipboard;
  course: CourseModel;
  target: Either<MissingTargetId, ContentElement>;
}

interface DispatchProps {
  displayModal: (component: any) => void;
  dismissModal: () => void;
  updateTarget: (targetId: string, documentId: string) => Promise<any>;
}

interface OwnProps extends AbstractContentEditorProps<contentTypes.Xref> {
  onShowSidebar: () => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    clipboard: state.clipboard,
    course: state.course,
    target: state.xref.target,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>): DispatchProps => {
  return {
    displayModal: component => dispatch(modalActions.display(component)),
    dismissModal: () => dispatch(modalActions.dismiss()),
    updateTarget: (targetId: string, documentId: string) =>
      dispatch(fetchAndSetTargetNode(targetId, documentId)),
  };
};

const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(XrefEditor);

export { controller as XrefEditor };
