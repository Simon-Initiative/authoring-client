import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ModuleEditor } from './ModuleEditor';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor';
import { Variables } from 'data/content/assessment/variable';
import { setSidebarContent, resetSidebarContent } from 'actions/editorSidebar';

interface StateProps {

}

interface DispatchProps {
  setSidebarContent: (content: JSX.Element) => void;
  resetSidebarContent: () => void;
}

interface OwnProps extends AbstractContentEditorProps<Variables> {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    setSidebarContent: (content: JSX.Element) => dispatch(setSidebarContent(content)),
    resetSidebarContent: () => dispatch(resetSidebarContent()),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ModuleEditor);

export { controller as ModuleEditor };
