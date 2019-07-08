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
import { DocumentId } from 'data/types';

interface StateProps {
  activeContext: any;
  hover: string;
  course: CourseState;
  currentNode: FeedbackQuestionNode;
}

interface DispatchProps {
  onUpdateContent: (documentId: DocumentId, content: Object) => void;
  onUpdateContentSelection: (
    documentId: DocumentId, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetCurrentNode: (documentId: DocumentId, node: Node) => void;
}

interface OwnProps extends AbstractEditorProps<FeedbackModel> { }

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { activeContext, hover, documents, course } = state;
  const currentNode = activeContext.documentId.caseOf({
    just: docId => documents.get(docId.value()).currentNode.valueOr(null),
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
    onUpdateContent: (documentId: DocumentId, content: ContentElement) =>
      dispatch(activeActions.updateContent(documentId, content)),

    onUpdateContentSelection: (
      documentId: DocumentId, content: ContentElement,
      parent: ParentContainer, textSelection: Maybe<TextSelection>) =>
      dispatch(activeActions.updateContext(documentId, content, parent, textSelection)),

    onUpdateHover: (hover: string) =>
      dispatch(updateHover(hover)),

    showMessage: (message: Messages.Message) =>
      dispatch(showMessage(message)),

    dismissMessage: (message: Messages.Message) =>
      dispatch(dismissSpecificMessage(message)),

    onSetCurrentNode: (documentId: DocumentId, node: Node) =>
      dispatch(setCurrentNodeOrPage(documentId, node)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(FeedbackEditor);
