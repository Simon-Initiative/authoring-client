import { connect } from 'react-redux';
import MainView from './MainView';

interface StateProps {
  user: any;
  modal: any;
  course: any;
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
  } = state;

  return {
    user,
    modal,
    course: {
      model: course.get('model').caseOf({
        just: c => c,
        nothing: c => undefined,
      }),
    },
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
  (mapStateToProps, mapDispatchToProps)(MainView);
