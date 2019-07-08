import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ActionsToolbar } from './ActionsToolbar';
import { resetActive } from 'actions/active';
import { showSidebar, resetSidebarContent } from 'actions/editorSidebar';
import { quickPreview } from 'actions/preview';
import { undo, redo } from 'actions/document';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models';
import { DocumentId } from 'data/types';

interface StateProps {
  course: CourseModel;
  canUndo: boolean;
  canRedo: boolean;
}

interface DispatchProps {
  onShowPageDetails: () => void;
  onQuickPreview: (resource: Resource) => Promise<any>;
  onUndo: (documentId: DocumentId) => void;
  onRedo: (documentId: DocumentId) => void;
}

interface OwnProps {
  editMode: boolean;
  documentResource: Resource;
  documentId: DocumentId;
  canPreview: boolean;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    course: state.course,
    canUndo: state.documents.get(ownProps.documentId.value()).undoStack.size > 0,
    canRedo: state.documents.get(ownProps.documentId.value()).redoStack.size > 0,
  };
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps): DispatchProps => {
  return {
    onShowPageDetails: () => {
      dispatch(resetActive());
      // Sidebar content may be overridden with the editorSidebar actions, so
      // we reset any sidebar content that might be shown.
      dispatch(resetSidebarContent());
      dispatch(showSidebar(true));
    },
    onQuickPreview: (resource: Resource) => dispatch(quickPreview(resource)),
    onUndo: (documentId: DocumentId) => dispatch(undo(documentId)),
    onRedo: (documentId: DocumentId) => dispatch(redo(documentId)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ActionsToolbar);

export { controller as ActionsToolbar };
