import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit, resetActive } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';
import { ParentContainer, TextSelection } from 'types/active.ts';
import { Maybe } from 'tsmonad';
import { CourseModel } from 'data/models/course';
import { modalActions } from 'actions/modal';
import { Resource } from 'data/content/resource';

interface StateProps {
  supportedElements: Immutable.List<string>;
  content: Object;
  container: Maybe<ParentContainer>;
  textSelection: Maybe<TextSelection>;
  courseModel: CourseModel;
  resource: Resource;
}

interface DispatchProps {
  onInsert: (content: Object, textSelection) => void;
  onEdit: (content: Object) => void;
  onShowPageDetails: () => void;
  onShowSidebar: () => void;
  onDisplayModal: (comp) => void;
  onDismissModal: () => void;
}

interface OwnProps {
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const activeContext : ActiveContextState = state.activeContext;
  const courseModel = state.course;
  const documentId = activeContext.documentId.caseOf({ just: d => d, nothing: () => '' });
  const resource = state.documents.get(documentId).document.model.resource;
  const supportedElements = activeContext.container.caseOf({
    just: c => c.supportedElements,
    nothing: () => Immutable.List<string>(),
  });

  return {
    courseModel,
    resource,
    supportedElements,
    content: activeContext.activeChild,
    container: activeContext.container,
    textSelection: activeContext.textSelection,
  };


};

const mapDispatchToProps = (dispatch): DispatchProps => {

  return {
    onEdit: content =>  dispatch(edit(content)),
    onInsert: (content, textSelection) => dispatch(insert(content, textSelection)),
    onShowPageDetails: () => {
      dispatch(resetActive());
      dispatch(showSidebar(true));
    },
    onShowSidebar: () => dispatch(showSidebar(true)),
    onDisplayModal: (comp) => {
      dispatch(modalActions.display(comp));
    },
    onDismissModal: () => {
      dispatch(modalActions.dismiss());
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
(mapStateToProps, mapDispatchToProps)(ContextAwareToolbar);

export { controller as ContextAwareToolbar };
