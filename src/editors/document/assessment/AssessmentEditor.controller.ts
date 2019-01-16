import { connect } from 'react-redux';
import AssessmentEditor from 'editors/document/assessment/AssessmentEditor';
import * as contentTypes from 'data/contentTypes';
import { State } from 'reducers';
import { fetchSkills } from 'actions/skills';
import { setCurrentNodeOrPage } from 'actions/document';
import { AbstractEditorProps } from 'editors/document/common/AbstractEditor';
import { AssessmentModel, CourseModel } from 'data/models';
import * as activeActions from 'actions/active';
import { updateHover } from 'actions/hover';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import * as Messages from 'types/messages';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import { ContentElement } from 'data/content/common/interfaces';
import { RouterState } from 'reducers/router';
import { setSearchParam, clearSearchParam } from 'actions/router';

interface StateProps {
  activeContext: any;
  hover: string;
  course: CourseModel;
  currentPage: string;
  currentNode: contentTypes.Node;
  router: RouterState;
}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetCurrentNodeOrPage: (documentId: string, nodeOrPageId: contentTypes.Node | string) => void;
  onSetSearchParam: (name, value) => void;
  onClearSearchParam: (name) => void;
}

interface OwnProps extends AbstractEditorProps<AssessmentModel> { }

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { activeContext, hover, documents, course, router } = state;

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
    router,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onFetchSkills: (courseId: string) => {
      return dispatch(fetchSkills(courseId));
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
    onSetCurrentNodeOrPage: (documentId: string, nodeOrPageId: contentTypes.Node | string) => {
      return dispatch(setCurrentNodeOrPage(documentId, nodeOrPageId));
    },
    showMessage: (message: Messages.Message) => {
      return dispatch(showMessage(message));
    },
    dismissMessage: (message: Messages.Message) => {
      dispatch(dismissSpecificMessage(message));
    },
    onSetSearchParam: (name, value) => dispatch(setSearchParam(name, value)),
    onClearSearchParam: name => dispatch(clearSearchParam(name)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(AssessmentEditor);
