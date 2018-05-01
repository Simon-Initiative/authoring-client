import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ContentDecorator } from './ContentDecorator';

interface StateProps {
  // activeContext: ActiveContextState;
}

interface DispatchProps {
  // onCut: (item: Object) => void;
  // onCopy: (item: Object) => void;
  // onPaste: () => void;
}

interface OwnProps {
  onRemove: () => void;
  onSelect: () => void;
  isActiveContent: boolean;
  contentType: string;
  hideContentLabel?: boolean;
  isHoveringContent: boolean;
  onMouseOver: () => void;
  className?: string;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    // activeContext: state.activeContext,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    // onCut: item => dispatch(cut(item)),
    // onCopy: item => dispatch(copy(item)),
    // onPaste: () => dispatch(paste()),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(ContentDecorator);

export { controller as ContentDecorator };
