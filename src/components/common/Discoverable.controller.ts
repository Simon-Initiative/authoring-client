import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { Discoverable, FocusAction } from './Discoverable';
import { DiscoverableId } from 'types/discoverable';
import { DiscoverableState } from 'reducers/discoverable';

export { FocusAction, DiscoverableId };

interface StateProps {
  discoverables: DiscoverableState;
}

interface DispatchProps {

}

interface OwnProps {
  id: DiscoverableId;
  onDiscover?: () => void;
  focusChild?: boolean | string;
  focusAction?: FocusAction;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    discoverables: state.discoverable,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(Discoverable);

export { controller as Discoverable };
