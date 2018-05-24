import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ActionsToolbar } from './ActionsToolbar';
import { resetActive } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';
import { preview } from 'actions/preview';
import { undo, redo } from 'actions/document';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models';

interface StateProps {
  course: CourseModel;
  canUndo: boolean;
  canRedo: boolean;
}

interface DispatchProps {
  onShowPageDetails: () => void;
  onPreview: (courseId: string, resource: Resource) => Promise<any>;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onDispatch: (...args: any[]) => any;
}

interface OwnProps {
  documentResource: Resource;
  documentId: string;
  canPreview: boolean;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    course: state.course,
    canUndo: state.documents.get(ownProps.documentId).undoStack.size > 0,
    canRedo: state.documents.get(ownProps.documentId).redoStack.size > 0,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onShowPageDetails: () => {
      dispatch(resetActive());
      dispatch(showSidebar(true));
    },
    onPreview: (courseId: string, resource: Resource) => {
      return dispatch(preview(courseId, resource, false));
    },
    onUndo: (documentId: string) => {
      return dispatch(undo(documentId));
    },
    onRedo: (documentId: string) => {
      return dispatch(redo(documentId));
    },
    onDispatch: dispatch,
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(ActionsToolbar);

export { controller as ActionsToolbar };
