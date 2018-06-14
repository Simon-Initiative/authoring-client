import { connect } from 'react-redux';
import AssessmentEditor from './AssessmentEditor';
import * as contentTypes from 'data/contentTypes';
import { State } from 'reducers';
import { fetchSkills } from 'actions/skills';
import { setCurrentNode } from 'actions/document';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { AssessmentModel, CourseModel } from 'data/models';
import * as activeActions from 'actions/active';
import { updateHover } from 'actions/hover';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import * as Messages from 'types/messages';
import { dismissSpecificMessage, showMessage } from 'actions/messages';

interface StateProps {
  activeContext: any;
  hover: string;
  course: CourseModel;
  currentPage: string;
  currentNode: contentTypes.Node;
}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
  onSetCurrentNode: (documentId: string, node: contentTypes.Node) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
}

interface OwnProps extends AbstractEditorProps<AssessmentModel> {}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { activeContext, hover, documents, course } = state;

  return {
    activeContext,
    hover,
    course,
    currentPage: activeContext.documentId.caseOf({
      just: docId => documents.get(docId).currentPage.valueOr(null),
      nothing: null,
    }),
    currentNode: activeContext.documentId.caseOf({
      just: docId => documents.get(docId).currentNode.valueOr(null),
      nothing: null,
    }),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onFetchSkills: (courseId: string) => {
      return dispatch(fetchSkills(courseId));
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
    onSetCurrentNode: (documentId: string, node: contentTypes.Node) => {
      return dispatch(setCurrentNode(documentId, node));
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
  (mapStateToProps, mapDispatchToProps)(AssessmentEditor);
