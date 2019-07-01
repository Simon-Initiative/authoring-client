import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ActiveContextState } from 'reducers/active';
import { ItemToolbar } from './ItemToolbar';
import { AppContext } from 'editors/common/AppContext';
import { remove } from 'actions/active';
import { cut, copy, paste } from 'actions/clipboard';
import { ContentElement } from 'data/content/common/interfaces';

interface StateProps {
  activeContext: ActiveContextState;
  modelId: string;
}

interface DispatchProps {
  onCut: (item: ContentElement, page: string) => void;
  onCopy: (item: ContentElement, page: string) => void;
  onPaste: () => void;
  onRemove: (item: ContentElement) => void;
}

interface OwnProps {
  editMode: boolean;
  context: AppContext;
  parentSupportsElementType: (type: string) => boolean;
}

const mapStateToProps = (state: State): StateProps => {

  const docs = state.documents;

  return {
    activeContext: state.activeContext,
    modelId: docs.size > 0 && (docs.first().document.model as any).resource !== undefined
      ? (docs.first().document.model as any).resource.id
      : null,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>): DispatchProps => {
  return {
    onCut: (item, page) => dispatch(cut(item, page) as any),
    onCopy: (item, page) => dispatch(copy(item, page) as any),
    onPaste: () => dispatch(paste() as any),
    onRemove: item => dispatch(remove(item) as any),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ItemToolbar);

export { controller as ItemToolbar };
