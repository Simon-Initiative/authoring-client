import { connect } from 'react-redux';
import { TitlesState } from 'reducers//titles';
import Main from './Main';

interface StateProps {
  user: any;
  modal: any;
  course: any;
  expanded: any;
  server: any;
  titles: TitlesState;
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
    course: {
      model: course.get('model').caseOf({
        just: c => c,
        nothing: c => undefined,
      }),
    },
    expanded,
    server,
    titles,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onDispatch: dispatch,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Main);
