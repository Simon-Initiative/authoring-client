import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { showSidebar } from 'actions/editorSidebar';

export const connectSidebarActions = () => {
  const mapStateToProps = (state: State, ownProps) => {
    return {

    };
  };

  const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps) => {
    return {
      onShowSidebar: () => dispatch(showSidebar(true)),
      onHideSidebar: () => dispatch(showSidebar(false)),
    };
  };

  return component => connect(mapStateToProps, mapDispatchToProps)(component);
};
