import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';
import { ParentContainer, TextSelection } from 'types/active.ts';
import { Resource } from 'data/content/resource';
import { Maybe } from 'tsmonad';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { modalActions } from 'actions/modal';
import { ContentModel } from 'data/models';

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
  onShowSidebar: () => void;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
}

interface OwnProps {
  context: AppContext;
  model: ContentModel;
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
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
    onShowSidebar: () => dispatch(showSidebar(true)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
(mapStateToProps, mapDispatchToProps)(ContextAwareToolbar);

export { controller as ContextAwareToolbar };
