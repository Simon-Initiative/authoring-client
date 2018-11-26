import { connect } from 'react-redux';
import OrgEditor from './OrgEditor';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { OrganizationModel, CourseModel } from 'data/models';
import { AppContext } from 'editors/common/AppContext';
import { undo, redo, documentEditingEnable } from 'actions/document';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import * as Messages from 'types/messages';

interface StateProps {
  canUndo: boolean;
  canRedo: boolean;
  course: CourseModel;
}

interface DispatchProps {
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onEditingEnable: (editable: boolean, documentId: string) => void;
}

interface OwnProps extends AbstractEditorProps<OrganizationModel> {
  context: AppContext;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    canUndo: state.documents.get(ownProps.context.documentId).undoStack.size > 0,
    canRedo: state.documents.get(ownProps.context.documentId).redoStack.size > 0,
    course: state.course,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    showMessage: (message: Messages.Message) => {
      return dispatch(showMessage(message));
    },
    dismissMessage: (message: Messages.Message) => {
      dispatch(dismissSpecificMessage(message));
    },
    onUndo: (documentId: string) =>
      dispatch(undo(documentId)),
    onRedo: (documentId: string) =>
      dispatch(redo(documentId)),
    onEditingEnable: (editable, documentId) =>
      dispatch(documentEditingEnable(editable, documentId)),
  };
};

const connected
  = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(OrgEditor);

export default connected;
