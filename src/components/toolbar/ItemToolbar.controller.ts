import { connect } from 'react-redux';
import { State } from 'reducers';
import { ActiveContextState } from 'reducers/active';
import { ItemToolbar } from './ItemToolbar';
import { AppContext } from 'editors/common/AppContext';
import { remove } from 'actions/active';
import { cut, copy, paste } from 'actions/clipboard';
import { ContentElement } from 'data/content/common/interfaces';
import { ResourceId } from 'data/types';

interface StateProps {
  activeContext: ActiveContextState;
  modelId: ResourceId | null;
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

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    onCut: (item, page) => dispatch(cut(item, page)),
    onCopy: (item, page) => dispatch(copy(item, page)),
    onPaste: () => dispatch(paste()),
    onRemove: item => dispatch(remove(item)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ItemToolbar);

export { controller as ItemToolbar };
