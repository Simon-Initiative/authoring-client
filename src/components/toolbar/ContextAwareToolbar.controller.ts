import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit, resetActive } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';

interface StateProps {
  supportedElements: Immutable.List<string>;
  content: Object;
}

interface DispatchProps {
  insert: (content: Object) => void;
  edit: (content: Object) => void;
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
  };


};

const mapDispatchToProps = (dispatch): DispatchProps => {

  return {
    edit: content =>  dispatch(edit(content)),
    insert: content => dispatch(insert(content)),
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
