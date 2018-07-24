import { connect, Dispatch } from 'react-redux';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { ContextAwareSidebar, SidebarContent } from 'components/sidebar/ContextAwareSidebar';
import { showSidebar } from 'actions/editorSidebar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit } from 'actions/active';
import { setCurrentPage } from 'actions/document';
import { ParentContainer } from 'types/active';
import { Resource } from 'data/content/resource';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentModel, CourseModel } from 'data/models';
import { modalActions } from 'actions/modal';

interface StateProps {
  content: Maybe<ContentElement>;
  container: Maybe<ParentContainer>;
  course: CourseModel;
  supportedElements: Immutable.List<string>;
  show: boolean;
  resource: Resource;
  currentPage: string;
  timeSkewInMs: number;
}

interface DispatchProps {
  onInsert: (content: ContentElement, textSelection) => void;
  onEdit: (content: ContentElement) => void;
  onHide: () => void;
  onSetCurrentPage: (documentId: string, pageId: string) => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
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
    resource,
    timeSkewInMs,
    currentPage: activeContext.documentId.caseOf({
      just: docId => state.documents.get(docId).currentPage.valueOr(null),
      nothing: null,
    }),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onInsert: content => dispatch(insert(content)),
    onEdit: content => dispatch(edit(content)),
    onHide: () => dispatch(showSidebar(false)),
    onSetCurrentPage: (documentId: string, pageId: string) =>
      dispatch(setCurrentPage(documentId, pageId)),
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
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
