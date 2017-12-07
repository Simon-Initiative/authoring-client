import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavigationBar from './NavigationBar';
import * as viewActions from 'actions/view';

interface StateProps {
  course: any;
  user: any;
}

interface DispatchProps {
  viewActions: any;
}

interface OwnProps {
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const {
    course,
    user,
  } = state;

  return {
    course,
    user,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {



  const actions = Object.keys(viewActions).reduce(
    (p, c) => {
      p[c] = viewActions[c];
      return p;
    },
    {});


  return {
    viewActions: bindActionCreators(actions, dispatch),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(NavigationBar);
