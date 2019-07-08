import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import * as Immutable from 'immutable';
import WorkbookPageEditor from 'editors/document/workbook/WorkbookPageEditor';
import { fetchObjectives } from 'actions/objectives';
import { AbstractEditorProps } from 'editors/document/common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';
import { updateHover } from 'actions/hover';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import * as activeActions from 'actions/active';
import * as Messages from 'types/messages';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import { ContentElement } from 'data/content/common/interfaces';
import { setOrderedIds } from 'actions/bibliography';
import { CourseIdVers, DocumentId } from 'data/types';

interface StateProps {
  activeContext: any;
  hover: string;
}

interface DispatchProps {
  fetchObjectives: (courseId: CourseIdVers) => void;
  onUpdateContent: (documentId: DocumentId, content: ContentElement) => void;
  onUpdateContentSelection: (
    documentId: DocumentId, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  setOrderedIds: (ids: Immutable.Map<string, number>) => void;
}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> { }

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { activeContext, hover } = state;

  return {
    activeContext,
    hover,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    fetchObjectives: (courseId: CourseIdVers) => {
      return dispatch(fetchObjectives(courseId) as any);
    },
    onUpdateContent: (documentId: DocumentId, content: ContentElement) => {
      return dispatch(activeActions.updateContent(documentId, content));
    },
    onUpdateContentSelection: (
      documentId: DocumentId, content: ContentElement,
      parent: ParentContainer, textSelection: Maybe<TextSelection>) => {

      return dispatch(activeActions.updateContext(documentId, content, parent, textSelection));
    },
    onUpdateHover: (hover: string) => {
      return dispatch(updateHover(hover));
    },
    showMessage: (message: Messages.Message) => {
      return dispatch(showMessage(message));
    },
    dismissMessage: (message: Messages.Message) => {
      dispatch(dismissSpecificMessage(message));
    },
    setOrderedIds: (ids: Immutable.Map<string, number>) => {
      dispatch(setOrderedIds(ids));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
