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
}

interface DispatchProps {
  onCut: (item: ContentElement) => void;
  onCopy: (item: ContentElement) => void;
  onPaste: () => void;
  onRemove: (item: ContentElement) => void;
}

interface OwnProps {
  context: AppContext;
  parentSupportsElementType: (type: string) => boolean;
}

const mapStateToProps = (state: State): StateProps => {
  return {
    activeContext: state.activeContext,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>): DispatchProps => {
  return {
    onCut: item => dispatch(cut(item)),
    onCopy: item => dispatch(copy(item)),
    onPaste: () => dispatch(paste()),
    onRemove: item => dispatch(remove(item)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ItemToolbar);

export { controller as ItemToolbar };
