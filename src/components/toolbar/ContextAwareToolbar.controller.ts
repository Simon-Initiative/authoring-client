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
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContextAwareToolbar);
