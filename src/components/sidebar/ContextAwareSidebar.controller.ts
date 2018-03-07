import { connect, Dispatch } from 'react-redux';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { ContextAwareSidebar } from './ContextAwareSidebar';
import { showSidebar } from 'actions/editorSidebar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit } from 'actions/active';
import { ParentContainer } from 'types/active.ts';

interface StateProps {
  content: Maybe<Object>;
  container: Maybe<ParentContainer>;
  supportedElements: Immutable.List<string>;
  show: boolean;
}

interface DispatchProps {
  onInsert: (content: Object) => void;
  onEdit: (content: Object) => void;
  onHide: () => void;
}

interface OwnProps {
  show?: boolean;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const activeContext : ActiveContextState = state.activeContext;

  const supportedElements = activeContext.container.caseOf({
    just: c => c.supportedElements,
    nothing: () => Immutable.List<string>(),
  });

  return {
    content: activeContext.activeChild,
    container: activeContext.container,
    supportedElements,
    show: state.editorSidebar.show,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onInsert: content => dispatch(insert(content)),
    onEdit: content =>  dispatch(edit(content)),
    onHide: () => dispatch(showSidebar(false)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(ContextAwareSidebar);

export { controller as ContextAwareSidebar };
