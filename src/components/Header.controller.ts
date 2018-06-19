import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from './Header';
import * as viewActions from 'actions/view';

interface StateProps {
  course: any;
  user: any;
  isSaveInProcess: boolean;
}

interface DispatchProps {
  viewActions: viewActions.ViewActions;
}

interface OwnProps {
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const {
    course,
    user,
    documents,
  } = state;

  const isSaveInProcess = documents.toArray().some(d => d.saveInProcess);

  return {
    course,
    user,
    isSaveInProcess,
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
    viewActions: (bindActionCreators(actions, dispatch) as viewActions.ViewActions),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Header);
