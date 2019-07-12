import { connect } from 'react-redux';
import CourseEditor from './CourseEditor';
import * as persistence from 'data/persistence';
import { CourseModel } from 'data/models';
import { courseChanged } from 'actions/course';
import * as viewActions from 'actions/view';
import { modalActions } from 'actions/modal';
import { createNewDataSet } from 'actions/analytics';
import { AnalyticsState } from 'reducers/analytics';
import { UserState } from 'reducers/user';
import * as Messages from 'types/messages';
import { showMessage } from 'actions/messages';
import { load as loadOrg, releaseOrg } from 'actions/orgs';
import { CourseIdVers } from 'data/types';

interface StateProps {
  user: UserState;
  analytics: AnalyticsState;
  currentOrgDoc: persistence.Document;
}

interface DispatchProps {
  onLoadOrg: (courseId: CourseIdVers, documentId: string) => Promise<persistence.Document>;
  onReleaseOrg: () => void;
  courseChanged: (model: CourseModel) => void;
  viewAllCourses: () => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onCreateDataset: () => void;
  onShowMessage: (message: Messages.Message) => void;

  dispatch: any;
}

interface OwnProps {
  model: CourseModel;
  editMode: boolean;
  onCreateOrg: (title: string) => void;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  return {
    user: state.user,
    analytics: state.analytics,
    currentOrgDoc: state.orgs.activeOrg.caseOf(
      { just: doc => doc, nothing: () => null }),
  };
};

const mapDispatchToProps = (d): DispatchProps => {
  return {
    courseChanged: (model: CourseModel) =>
      d(courseChanged(model)),
    viewAllCourses: () => viewActions.viewAllCourses(),
    onDisplayModal: component => d(modalActions.display(component)),
    onDismissModal: () => d(modalActions.dismiss()),
    onShowMessage: (message: Messages.Message) => d(showMessage(message)),
    onCreateDataset: () => d(createNewDataSet()),
    onLoadOrg: (courseId: CourseIdVers, documentId: string) =>
      d(loadOrg(courseId, documentId)),
    onReleaseOrg: () => d(releaseOrg() as any),
    dispatch: d,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CourseEditor);
