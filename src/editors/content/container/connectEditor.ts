import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { showSidebar } from 'actions/editorSidebar';
import { DiscoverableId } from 'types/discoverable';
import { discover } from 'actions/discoverable';

export const connectEditor = (component) => {
  const mapStateToProps = (state: State, ownProps) => {
    return {

    };
  };

  const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps) => {
    return {
      onShowSidebar: () => dispatch(showSidebar(true)),
      onHideSidebar: () => dispatch(showSidebar(false)),
      onDiscover: (id: DiscoverableId) => {
        dispatch(discover(id));
      },
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(component);
};
