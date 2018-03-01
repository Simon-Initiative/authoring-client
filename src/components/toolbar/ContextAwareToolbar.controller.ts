import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit } from 'actions/active';

interface StateProps {
  supportedElements: Immutable.List<string>;
  content: Object;
}

interface DispatchProps {
  insert: (content: Object) => void;
  edit: (content: Object) => void;
}

interface OwnProps {
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const activeContext : ActiveContextState = state.activeContext;

  if (activeContext.container === null) {
    return {
      supportedElements: Immutable.List<string>(),
      content: activeContext.activeChild,
    };
  }
  return {
    supportedElements: activeContext.container.supportedElements,
    content: activeContext.activeChild,
  };


};

const mapDispatchToProps = (dispatch): DispatchProps => {

  return {
    edit: content => dispatch(edit(content)),
    insert: content => dispatch(insert(content)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
(mapStateToProps, mapDispatchToProps)(ContextAwareToolbar);

export { controller as ContextAwareToolbar };
