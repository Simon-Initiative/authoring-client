import { connect, Dispatch } from 'react-redux';
import FeedbackEditor from 'editors/document/feedback/FeedbackEditor';
import { State } from 'reducers';
import { AbstractEditorProps } from 'editors/document/common/AbstractEditor';
import { CourseModel, FeedbackModel, FeedbackQuestionNode } from 'data/models';
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
  currentNode: FeedbackQuestionNode;
}

interface DispatchProps {
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetCurrentNode: (documentId: string, node: Node) => void;
}

interface OwnProps extends AbstractEditorProps<FeedbackModel> { }

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { activeContext, hover, documents, course } = state;
  const currentNode = activeContext.documentId.caseOf({
    just: docId => documents.get(docId).currentNode.valueOr(null),
    nothing: null,
  });

  return {
    activeContext,
    hover,
    course,
    currentNode,
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
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(FeedbackEditor);
