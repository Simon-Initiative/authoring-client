import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
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

interface StateProps {
  activeContext: any;
  hover: string;
}

interface DispatchProps {
  fetchObjectives: (courseId: string) => void;
  onUpdateContent: (documentId: string, content: ContentElement) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
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
    onUpdateContent: (documentId: string, content: ContentElement) => {
      return dispatch(activeActions.updateContent(documentId, content));
    },
    onUpdateContentSelection: (
      documentId: string, content: ContentElement,
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
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
