import { connect, Dispatch } from 'react-redux';
import EmbedActivityEditor from 'editors/document/embedactivity/EmbedActivityEditor';
import { State } from 'reducers';
import { AbstractEditorProps } from 'editors/document/common/AbstractEditor';
import { CourseModel, EmbedActivityModel, FeedbackQuestionNode } from 'data/models';
import * as activeActions from 'actions/active';
import { updateHover } from 'actions/hover';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import * as Messages from 'types/messages';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import { ContentElement } from 'data/content/common/interfaces';
import { Node } from 'data/content/assessment/node';
import { setCurrentNodeOrPage } from 'actions/document';
import { CourseState } from 'reducers/course';

interface StateProps {
  activeContext: any;
  hover: string;
  course: CourseState;
}

interface DispatchProps {
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: ContentElement, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetCurrentNode: (documentId: string, node: Node) => void;
  onUpdateEditor: (editor) => void;
}

interface OwnProps extends AbstractEditorProps<EmbedActivityModel> { }

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { activeContext, hover, documents, course } = state;

  return {
    activeContext,
    hover,
    course,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>): DispatchProps => {
  return {
    onUpdateContent: (documentId: string, content: ContentElement) =>
      dispatch(activeActions.updateContent(documentId, content)),

    onUpdateContentSelection: (
      documentId: string, content: ContentElement,
      parent: ParentContainer, textSelection: Maybe<TextSelection>) =>
      dispatch(activeActions.updateContext(documentId, content, parent, textSelection)),

    onUpdateHover: (hover: string) =>
      dispatch(updateHover(hover)),

    showMessage: (message: Messages.Message) =>
      dispatch(showMessage(message)),

    dismissMessage: (message: Messages.Message) =>
      dispatch(dismissSpecificMessage(message)),

    onSetCurrentNode: (documentId: string, node: Node) =>
      dispatch(setCurrentNodeOrPage(documentId, node)),

    onUpdateEditor: editor =>
      dispatch(activeActions.updateEditor(editor)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EmbedActivityEditor);
