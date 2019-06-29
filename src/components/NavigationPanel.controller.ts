import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationPanel } from 'components/NavigationPanel';
import * as viewActions from 'actions/view';
import { State } from 'reducers';
import { Document } from 'data/persistence';
import { UserProfile } from 'types/user';
import { load as loadOrg, releaseOrg } from 'actions/orgs';
import { CourseIdVers } from 'data/types';
import { preview } from 'actions/preview';
import { RouteCourse } from 'types/router';
import { CourseModel } from 'data/models/course';

interface StateProps {
}

interface DispatchProps {
  viewActions: viewActions.ViewActions;
  onLoadOrg: (courseId: CourseIdVers, documentId: string) => Promise<Document>;
  onReleaseOrg: () => void;
  onPreview: (courseId: CourseIdVers, organizationId: string, redeploy: boolean) =>
    Promise<any>;
}

interface OwnProps {
  course: CourseModel;
  route: RouteCourse;
  profile: UserProfile;
  userId: string;
  userName: string;
  onCreateOrg: () => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

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
    onLoadOrg: (courseId: CourseIdVers, documentId: string) =>
      dispatch(loadOrg(courseId, documentId)),
    onReleaseOrg: () => dispatch(releaseOrg() as any),
    onPreview: (courseId: CourseIdVers, organizationId: string, redeploy: boolean) =>
      dispatch(preview(courseId, organizationId, false, redeploy)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(NavigationPanel);

export { controller as NavigationPanel };
