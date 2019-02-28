import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationPanel } from 'components/NavigationPanel';
import * as viewActions from 'actions/view';
import { CourseModel } from 'data/models';
import { RouterState } from 'reducers/router';
import { Maybe } from 'tsmonad';
import { State } from 'reducers';
import { Document } from 'data/persistence';
import { UserProfile } from 'types/user';

interface StateProps {
  course: CourseModel;
  router: RouterState;
  activeOrg: Maybe<Document>;
}

interface DispatchProps {
  viewActions: viewActions.ViewActions;
}

interface OwnProps {
  profile: UserProfile;
  userId: string;
  userName: string;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { course, router, orgs } = state;

  return {
    course,
    router,
    activeOrg: orgs.activeOrg,
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

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(NavigationPanel);

export { controller as NavigationPanel };
