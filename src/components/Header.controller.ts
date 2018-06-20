import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from './Header';
import { Maybe } from 'tsmonad';
import * as viewActions from 'actions/view';

interface StateProps {
  course: any;
  user: any;
  isSaveInProcess: boolean;
  lastRequestSucceeded: Maybe<boolean>;
  saveCount: number;
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

  const doc =  documents.toArray().length > 0
    ? documents.toArray()[0]
    : { isSaving: false, lastRequestSucceeded: Maybe.nothing(), saveCount: 0 };
  const isSaveInProcess = doc.isSaving;
  const lastRequestSucceeded = doc.lastRequestSucceeded;
  const saveCount = doc.saveCount;

  return {
    course,
    user,
    isSaveInProcess,
    lastRequestSucceeded,
    saveCount,
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
