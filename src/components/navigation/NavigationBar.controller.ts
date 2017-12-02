import { connect } from 'react-redux';
import NavigationBar from './NavigationBar';

interface StateProps {
  course: any;
  user: any;
}

interface DispatchProps {
  onDispatch: (...args: any[]) => any;
}

interface OwnProps {
  viewActions: any;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const {
    course,
    user,
  } = state;

  return {
    course: {
      model: course.caseOf({
        just: m => m,
        nothing: m => undefined,
      }),
    },
    user,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onDispatch: dispatch,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(NavigationBar);
