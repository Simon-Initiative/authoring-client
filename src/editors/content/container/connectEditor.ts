import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { Maybe } from 'tsmonad';
import { showSidebar } from 'actions/editorSidebar';
import { updateEditor, selectInline } from 'actions/active';
import { DiscoverableId } from 'types/discoverable';
import { discover } from 'actions/discoverable';
import { Inline } from 'slate';

export const connectEditor = (component) => {
  const mapStateToProps = (state: State, ownProps) => {
    return {
      course: state.course,
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps) => {
    return {
      onShowSidebar: () => dispatch(showSidebar(true)),
      onHideSidebar: () => dispatch(showSidebar(false)),
      onDiscover: (id: DiscoverableId) => {
        dispatch(discover(id) as any);
      },
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(component);
};


export const connectTextEditor = (component) => {
  const mapStateToProps = (state: State, ownProps) => {
    return {

    };
  };

  const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps) => {
    return {
      onUpdateEditor: (editor) => {
        dispatch(updateEditor(editor));
      },
      onSelectInline: (wrapper: Maybe<Inline>) => {
        dispatch(selectInline(wrapper));
      },
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(component);
};



export const connectPopupEditor = (component) => {
  const mapStateToProps = (state: State, ownProps) => {
    const { activeContext, hover } = state;

    const activeContentGuid = activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    return {
      activeContext,
      hover,
      activeContentGuid,
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps) => {
    return {
      onShowSidebar: () => dispatch(showSidebar(true)),
      onHideSidebar: () => dispatch(showSidebar(false)),
      onDiscover: (id: DiscoverableId) => {
        dispatch(discover(id) as any);
      },
    };
  };

  return component;
};
