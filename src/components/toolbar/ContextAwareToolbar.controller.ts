import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit } from 'actions/active';
import { createNew } from 'actions/document';
import { showSidebar } from 'actions/editorSidebar';
import { ParentContainer, ActiveContext } from 'types/active';
import { Resource } from 'data/content/resource';
import { Maybe } from 'tsmonad';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { modalActions } from 'actions/modal';
import { ContentModel } from 'data/models';
import { ContentElement } from 'data/content/common/interfaces';
import { Message } from 'types/messages';
import { showMessage, dismissSpecificMessage } from 'actions/messages';

interface StateProps {
  supportedElements: Immutable.List<string>;
  content: Object;
  activeContext: ActiveContext;
  container: Maybe<ParentContainer>;
  courseModel: CourseModel;
  resource: Resource;
}

interface DispatchProps {
  onInsert: (content: ContentElement | ContentElement[], snapshot) => void;
  onEdit: (content: ContentElement) => void;
  onShowSidebar: () => void;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
  onCreateNew: (model: ContentModel) => Promise<Resource>;
  onShowMessage: (message: Message) => void;
  onDismissMessage: (message: Message) => void;
}

interface OwnProps {
  editMode: boolean;
  context: AppContext;
  model: ContentModel;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const activeContext: ActiveContextState = state.activeContext;
  const courseModel = state.course;
  const documentId = activeContext.documentId.caseOf({ just: d => d.value(), nothing: () => '' });
  const resource = state.documents.get(documentId).document.model.resource;
  const supportedElements = activeContext.container.caseOf({
    just: c => c.supportedElements,
    nothing: () => Immutable.List<string>(),
  });

  return {
    courseModel,
    resource,
    supportedElements,
    activeContext,
    content: activeContext.activeChild,
    container: activeContext.container,
  };

};

const mapDispatchToProps = (dispatch): DispatchProps => {

  return {
    onEdit: content => dispatch(edit(content)),
    onInsert: (content, snapshot) => dispatch(insert(content, snapshot)),
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
    onShowSidebar: () => dispatch(showSidebar(true)),
    onCreateNew: (model: ContentModel) => {
      return new Promise((resolve, reject) => {
        dispatch(createNew(model))
          .then(resource => resolve(resource));
      });
    },
    onShowMessage: (message: Message) => {
      dispatch(showMessage(message));
    },
    onDismissMessage: (message: Message) => {
      dispatch(dismissSpecificMessage(message));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContextAwareToolbar);

export { controller as ContextAwareToolbar };
