import { connect } from 'react-redux';
import CourseEditor from './CourseEditor';
import { CourseModel } from 'data/models';
import { courseChanged } from 'actions/course';
import * as viewActions from 'actions/view';
import { modalActions } from 'actions/modal';
import { createNewDataSet } from 'actions/analytics';
import { AnalyticsState } from 'reducers/analytics';
import { UserState } from 'reducers/user';
import * as Messages from 'types/messages';
import { showMessage } from 'actions/messages';

interface StateProps {
  user: UserState;
  analytics: AnalyticsState;
}

interface DispatchProps {
  courseChanged: (model: CourseModel) => void;
  viewAllCourses: () => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onCreateDataset: () => void;
  onShowMessage: (message: Messages.Message) => void;
}

interface OwnProps {
  model: CourseModel;
  editMode: boolean;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    user: state.user,
    analytics: state.analytics,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    courseChanged: (model: CourseModel) =>
      dispatch(courseChanged(model)),
    viewAllCourses: () => viewActions.viewAllCourses(),
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
    onShowMessage: (message: Messages.Message) => dispatch(showMessage(message)),
    onCreateDataset: () => dispatch(createNewDataSet()),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CourseEditor);
