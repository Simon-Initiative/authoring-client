import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit, resetActive } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';
import { ParentContainer } from 'types/active.ts';
import { Maybe } from 'tsmonad';

interface StateProps {
  supportedElements: Immutable.List<string>;
  content: Object;
  container: Maybe<ParentContainer>;
}

interface DispatchProps {
  onInsert: (content: Object) => void;
  onEdit: (content: Object) => void;
  onShowPageDetails: () => void;
  onShowSidebar: () => void;
}

interface OwnProps {
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
  };


};

const mapDispatchToProps = (dispatch): DispatchProps => {

  return {
    onEdit: content =>  dispatch(edit(content)),
    onInsert: content => dispatch(insert(content)),
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
