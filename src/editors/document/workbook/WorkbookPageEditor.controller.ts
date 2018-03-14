import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import WorkbookPageEditor from './WorkbookPageEditor';
import { fetchObjectives } from 'actions/objectives';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';
import { Resource } from 'data/contentTypes';
import { preview } from 'actions/preview';
import { updateHover } from 'actions/hover';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import * as activeActions from 'actions/active';

interface StateProps {
  activeContext: any;
  hover: string;
}

interface DispatchProps {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> {}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { activeContext, hover } = state;

  return {
    activeContext,
    hover,
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
      documentId: string, content: Object,
      parent: ParentContainer, textSelection: Maybe<TextSelection>) => {

      return dispatch(activeActions.updateContext(documentId, content, parent, textSelection));
    },
    onUpdateHover: (hover: string) => {
      return dispatch(updateHover(hover));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
