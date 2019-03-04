import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { SidebarToggle } from './SidebarToggle';
import { EditorSidebarState } from 'reducers/editorSidebar';
import { showSidebar } from 'actions/editorSidebar';

interface StateProps {
  editorSidebar: EditorSidebarState;
}

interface DispatchProps {
  onToggleSidebar: (show: boolean) => void;
}

interface OwnProps {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { editorSidebar } = state;

  return {
    editorSidebar,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onToggleSidebar: (show: boolean) => dispatch(showSidebar(show)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(SidebarToggle);

export { controller as SidebarToggle };
