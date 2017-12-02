import { connect } from 'react-redux';
import { CourseModel } from 'data/models';
import { Maybe } from 'tsmonad';
import Main from './Main';

interface StateProps {
  user: any;
  modal: any;
  course: CourseModel;
  expanded: any;
  server: any;
}

interface DispatchProps {
  onDispatch: (...args: any[]) => any;
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
    titles,
  } = state;

  return {
    user,
    modal,
    course: course.caseOf({
      just: c => c,
      nothing: c => undefined,
    }),
    expanded,
    server,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onDispatch: dispatch,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Main);
