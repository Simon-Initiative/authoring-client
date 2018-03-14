import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { ActiveContextState } from 'reducers/active';
import { insert, edit, resetActive } from 'actions/active';
import { showSidebar } from 'actions/editorSidebar';
import { ParentContainer, TextSelection } from 'types/active.ts';
import { Resource } from 'data/content/resource';
import { Maybe } from 'tsmonad';

interface StateProps {
  supportedElements: Immutable.List<string>;
  content: Object;
  container: Maybe<ParentContainer>;
  textSelection: Maybe<TextSelection>;
}

interface DispatchProps {
  onInsert: (content: Object, textSelection) => void;
  onEdit: (content: Object) => void;
  onShowSidebar: () => void;
  onShowPageDetails: () => void;
}

interface OwnProps {
  documentResource: Resource;
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
