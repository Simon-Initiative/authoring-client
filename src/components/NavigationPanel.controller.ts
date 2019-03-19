import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationPanel } from 'components/NavigationPanel';
import * as viewActions from 'actions/view';
import { CourseModel } from 'data/models';
import { RouterState } from 'reducers/router';
import { State } from 'reducers';
import { Document } from 'data/persistence';
import { UserProfile } from 'types/user';
import { load as loadOrg, releaseOrg } from 'actions/orgs';
import { CourseId } from 'data/types';
import { preview } from 'actions/preview';

interface StateProps {
  course: CourseModel;
  router: RouterState;
}

interface DispatchProps {
  viewActions: viewActions.ViewActions;
  onLoadOrg: (courseId: string, documentId: string) => Promise<Document>;
  onReleaseOrg: () => void;
  onPreview: (courseId: CourseId, organizationId: string, redeploy: boolean) => Promise<any>;
}

interface OwnProps {
  profile: UserProfile;
  userId: string;
  userName: string;
  onCreateOrg: () => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { course, router } = state;

  return {
    course,
    router,
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
    onLoadOrg: (courseId: string, documentId: string) => dispatch(loadOrg(courseId, documentId)),
    onReleaseOrg: () => dispatch(releaseOrg() as any),
    onPreview: (courseId: CourseId, organizationId: string, redeploy: boolean) =>
      dispatch(preview(courseId, organizationId, false, redeploy)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(NavigationPanel);

export { controller as NavigationPanel };
