import { connect } from 'react-redux';
import Header from 'components/Header';
import { Maybe } from 'tsmonad';
import { RouterState } from 'reducers/router';

interface StateProps {
  course: any;
  user: any;
  isSaveInProcess: boolean;
  lastRequestSucceeded: Maybe<boolean>;
  saveCount: number;
  router: RouterState;
}

interface DispatchProps {
}

interface OwnProps {
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const {
    course,
    user,
    documents,
    router,
  } = state;

  const doc = documents.toArray().length > 0
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
    router,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {

  return {

  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Header);
