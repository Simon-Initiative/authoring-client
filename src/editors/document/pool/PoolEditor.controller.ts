import { connect } from 'react-redux';
import { OrderedMap } from 'immutable';
import PoolEditor from 'editors/document/pool/PoolEditor';
import * as contentTypes from 'data/contentTypes';
import { fetchSkills } from 'actions/skills';
import { setCurrentNodeOrPage } from 'actions/document';
import { Skill } from 'types/course';
import { AbstractEditorProps } from 'editors/document/common/AbstractEditor';
import { PoolModel, CourseModel } from 'data/models';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';
import * as activeActions from 'actions/active';
import { updateHover } from 'actions/hover';
import * as Messages from 'types/messages';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import { ContentElement } from 'data/content/common/interfaces';
import { RouterState } from 'reducers/router';
import { setSearchParam, clearSearchParam } from 'actions/router';
import { CourseIdVers, DocumentId } from 'data/types';
import { State } from 'reducers/index';

interface StateProps {
  skills: OrderedMap<string, Skill>;
  activeContext: any;
  hover: string;
  course: CourseModel;
  currentNode: Maybe<contentTypes.Node>;
  router: RouterState;
}

interface DispatchProps {
  onFetchSkills: (courseId: CourseIdVers) => any;
  onUpdateContent: (documentId: DocumentId, content: Object) => void;
  onUpdateContentSelection: (
    documentId: DocumentId, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  onSetCurrentNodeOrPage: (documentId: DocumentId, nodeOrPageId: contentTypes.Node | string) =>
    void;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  onSetSearchParam: (name, value) => void;
  onClearSearchParam: (name) => void;
}

interface OwnProps extends AbstractEditorProps<PoolModel> { }

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { activeContext, skills, hover, course, documents, router } = state;

  return {
    activeContext,
    skills: skills.map(skill => ({ id: skill.id, title: skill.title })).toOrderedMap(),
    hover,
    course,
    currentNode: activeContext.documentId.caseOf({
      just: docId => documents.get(docId.value()).currentNode,
      nothing: () => Maybe.nothing<contentTypes.Node>(),
    }),
    router,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onFetchSkills: (courseId: CourseIdVers) => {
      return dispatch(fetchSkills(courseId));
    },
    onUpdateContent: (documentId: DocumentId, content: ContentElement) => {
      return dispatch(activeActions.updateContent(documentId, content));
    },
    onUpdateContentSelection: (
      documentId: DocumentId, content: ContentElement,
      parent: ParentContainer, textSelection: Maybe<TextSelection>) => {

      return dispatch(activeActions.updateContext(documentId, content, parent, textSelection));
    },
    onSetCurrentNodeOrPage: (documentId: DocumentId, nodeOrPageId: contentTypes.Node) => {
      return dispatch(setCurrentNodeOrPage(documentId, nodeOrPageId));
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
    onSetSearchParam: (name, value) => dispatch(setSearchParam(name, value)),
    onClearSearchParam: name => dispatch(clearSearchParam(name)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(PoolEditor);
