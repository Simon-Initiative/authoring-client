import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit, resetActive } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';
import { ParentContainer, TextSelection } from 'types/active.ts';
import { Maybe } from 'tsmonad';
import { modalActions } from 'actions/modal';
import { AppContext } from 'editors/common/AppContext';

interface StateProps {
  supportedElements: Immutable.List<string>;
  content: Object;
  container: Maybe<ParentContainer>;
  textSelection: Maybe<TextSelection>;
}

interface DispatchProps {
  onInsert: (content: Object, textSelection) => void;
  onEdit: (content: Object) => void;
  onShowPageDetails: () => void;
  onShowSidebar: () => void;
  displayModal: (component: any) => void;
  dismissModal: () => void;
}

interface OwnProps {
  context: AppContext;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const activeContext : ActiveContextState = state.activeContext;

  const supportedElements = activeContext.container.caseOf({
    just: c => c.supportedElements,
    nothing: () => Immutable.List<string>(),
  });

  return {
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
    displayModal: component => dispatch(modalActions.display(component)),
    dismissModal: () => dispatch(modalActions.dismiss()),
    onShowPageDetails: () => {
      dispatch(resetActive());
      dispatch(showSidebar(true));
    },
    onShowSidebar: () => dispatch(showSidebar(true)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
(mapStateToProps, mapDispatchToProps)(ContextAwareToolbar);

export { controller as ContextAwareToolbar };
