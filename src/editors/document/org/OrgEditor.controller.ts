import { connect } from 'react-redux';
import OrgEditor from './OrgEditor';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { OrganizationModel, CourseModel } from 'data/models';
import { AppContext } from 'editors/common/AppContext';
import { undo, redo, documentEditingEnable } from 'actions/document';

interface StateProps {
  canUndo: boolean;
  canRedo: boolean;
  course: CourseModel;
}

interface DispatchProps {
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
    onUndo: (documentId: string) =>
      dispatch(undo(documentId)),
    onRedo: (documentId: string) =>
      dispatch(redo(documentId)),
    onEditingEnable: (editable, documentId) =>
      dispatch(documentEditingEnable(editable, documentId)),
  };
};

const connected = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgEditor);

export default connected;
