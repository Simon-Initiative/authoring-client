import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { MultipanelEditor } from './MultipanelEditor';
import { ContentModel } from 'data/models';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor';
import { Multipanel } from 'data/contentTypes';
import { DiscoverableId } from 'types/discoverable';
import { modalActions } from 'actions/modal';

interface StateProps {
  documentModel: ContentModel;
}

interface DispatchProps {
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
}

interface OwnProps
  extends AbstractContentEditorProps<Multipanel> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { documents } = state;
  return {
    documentModel: documents.first() && documents.first().document.model,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(MultipanelEditor);

export { controller as MultipanelEditor };
