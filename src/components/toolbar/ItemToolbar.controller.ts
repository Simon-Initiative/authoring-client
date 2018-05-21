import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ActiveContextState } from 'reducers/active';
import { ItemToolbar } from './ItemToolbar';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { remove } from 'actions/active';
import { cut, copy, paste } from 'actions/clipboard';

interface StateProps {
  activeContext: ActiveContextState;
}

interface DispatchProps {
  onCut: (item: Object) => void;
  onCopy: (item: Object) => void;
  onPaste: () => void;
  onRemove: (item: Object) => void;
}

interface OwnProps {
  context: AppContext;
  parentSupportsElementType: (type: string) => boolean;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
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
