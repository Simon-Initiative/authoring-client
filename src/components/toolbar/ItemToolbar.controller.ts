import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ActiveContextState } from 'reducers/active';
import { ItemToolbar } from './ItemToolbar';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { resetActive } from 'actions/active';

interface StateProps {
  activeContext: ActiveContextState;
}

interface DispatchProps {
  onClearSelection: () => void;
}

interface OwnProps {
  context: AppContext;
  courseModel: CourseModel;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onClearSelection: () => {
      dispatch(resetActive());
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(ItemToolbar);

export { controller as ItemToolbar };
