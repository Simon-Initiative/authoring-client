import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import WorkbookPageEditor from './WorkbookPageEditor';
import { fetchObjectives } from 'actions/objectives';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';
import { Resource } from 'data/contentTypes';
import { preview } from 'actions/preview';
import { ParentContainer } from 'types/active';
import * as activeActions from 'actions/active';

interface StateProps {
  activeContext: any;
}

interface DispatchProps {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer) => void;
}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> {}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { activeContext, editorSidebar } = state;

  return {
    activeContext,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    fetchObjectives: (courseId: string) => {
      return dispatch(fetchObjectives(courseId));
    },
    preview: (courseId: string, resource: Resource) => {
      return dispatch(preview(courseId, resource, false));
    },
    onUpdateContent: (documentId: string, content: Object) => {
      return dispatch(activeActions.updateContent(documentId, content));
    },
    onUpdateContentSelection: (
      documentId: string, content: Object, parent: ParentContainer) => {
      return dispatch(activeActions.updateContext(documentId, content, parent));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
