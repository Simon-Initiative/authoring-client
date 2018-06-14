import { connect } from 'react-redux';
import { UserState } from 'reducers/user';
import { ModalState } from 'reducers/modal';
import { CourseState } from 'reducers/course';
import { ExpandedState } from 'reducers/expanded';
import { ServerState } from 'reducers/server';
import { HoverState } from 'reducers/hover';
import { updateHover } from 'actions/hover';
import Main from './Main';

interface StateProps {
  user: UserState;
  modal: ModalState;
  course: CourseState;
  expanded: ExpandedState;
  server: ServerState;
  hover: HoverState;
}

interface DispatchProps {
  onDispatch: (...args: any[]) => any;
  onUpdateHover: (hover: string) => void;
}

interface OwnProps {
  location: any;
}

const mapStateToProps = (state): StateProps => {
  const {
    user,
    modal,
    course,
    expanded,
    server,
  } = state;

  return {
    user,
    modal,
    course,
    expanded,
    server,
    hover: state.hover,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onDispatch: dispatch,
    onUpdateHover: (hover: string) => {
      return dispatch(updateHover(hover));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Main);
