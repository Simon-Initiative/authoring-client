import { connect, Dispatch } from 'react-redux';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { ContextAwareSidebar, SidebarContent } from 'components/sidebar/ContextAwareSidebar';
import { showSidebar } from 'actions/editorSidebar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit } from 'actions/active';
import { setCurrentNodeOrPage } from 'actions/document';
import { ParentContainer } from 'types/active';
import { Resource } from 'data/content/resource';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentModel, CourseModel, Node, ModelTypes, OrganizationModel } from 'data/models';
import { modalActions } from 'actions/modal';
import { CombinationsMap } from 'types/combinations';
import { computeCombinations } from 'actions/choices';
import { duplicate } from 'actions/duplication';
import { CourseState } from 'reducers/course';

interface StateProps {
  content: Maybe<ContentElement>;
  container: Maybe<ParentContainer>;
  course: CourseState;
  supportedElements: Immutable.List<string>;
  show: boolean;
  sidebarContent: JSX.Element;
  resource: Resource;
  currentPage: string;
  timeSkewInMs: number;
  selectedOrganization: Maybe<OrganizationModel>;
}

interface DispatchProps {
  onInsert: (content: ContentElement, textSelection) => void;
  onEdit: (content: ContentElement) => void;
  onHide: () => void;
  onSetCurrentNodeOrPage: (documentId: string, nodeOrPageId: Node | string) => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
  onDuplicate: (model: ContentModel) => void;
}

interface OwnProps {
  show?: boolean;
  context: AppContext;
  services: AppServices;
  model: ContentModel;
  editMode: boolean;
  onEditModel: (model: ContentModel) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const activeContext: ActiveContextState = state.activeContext;

  const { orgs } = state;

  const documentId = activeContext.documentId.caseOf({ just: d => d, nothing: () => '' });
  const resource = (state.documents.get(documentId).document.model as any).resource;

  const supportedElements = activeContext.container.caseOf({
    just: c => c.supportedElements,
    nothing: () => Immutable.List<string>(),
  });

  const { server: { timeSkewInMs } } = state;

  return {
    content: activeContext.activeChild,
    container: activeContext.container,
    course: state.course,
    supportedElements,
    show: state.editorSidebar.show,
    sidebarContent: state.editorSidebar.sidebarContent,
    resource,
    timeSkewInMs,
    currentPage: activeContext.documentId.caseOf({
      just: docId => state.documents.get(docId).currentPage.valueOr(null),
      nothing: null,
    }),
    selectedOrganization: orgs.activeOrg.lift(doc =>
      (doc.model as OrganizationModel)),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onInsert: content => dispatch(insert(content) as any),
    onEdit: content => dispatch(edit(content) as any),
    onHide: () => dispatch(showSidebar(false)),
    onSetCurrentNodeOrPage: (documentId: string, nodeOrPageId: Node | string) =>
      dispatch(setCurrentNodeOrPage(documentId, nodeOrPageId)),
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
    onGetChoiceCombinations: (comboNum: number): CombinationsMap => {
      return dispatch(computeCombinations(comboNum) as any);
    },
    onDuplicate: (model: ContentModel) => {
      return dispatch(duplicate(model) as any);
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContextAwareSidebar);

export { controller as ContextAwareSidebar };

interface SidebarContentStateProps {

}

interface SidebarContentDispatchProps {
  onHide: () => void;
}

interface SidebarContentOwnProps {
  title: string;
}

const mapSidebarContentStateToProps = (
  state: State,
  ownProps: SidebarContentOwnProps): SidebarContentStateProps => {
  const {
    server: { timeSkewInMs },
  } = state;

  return {
    timeSkewInMs,
  };
};

const mapSidebarContentDispatchToProps = (
  dispatch: Dispatch<State>,
  ownProps: SidebarContentOwnProps): SidebarContentDispatchProps => {
  return {
    onHide: () => dispatch(showSidebar(false)),
  };
};

export const sideBarController =
  connect<SidebarContentStateProps, SidebarContentDispatchProps, SidebarContentOwnProps>
    (mapSidebarContentStateToProps, mapSidebarContentDispatchToProps)(SidebarContent);

export { sideBarController as SidebarContent };
