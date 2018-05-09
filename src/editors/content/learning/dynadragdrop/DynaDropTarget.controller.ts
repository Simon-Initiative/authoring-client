import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { DynaDropTarget } from './DynaDropTarget';

interface StateProps {

}

interface DispatchProps {

}

interface OwnProps {
  id: string;
  label: string;
  className?: string;
  header?: boolean;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    selectedTarget: state.dynadragdrop.selectedInitiator,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(DynaDropTarget);

export { controller as DynaDropTarget };
