import { connect } from 'react-redux';
import CourseEditor from './CourseEditor';
import { CourseModel } from 'data/models';
import { courseChanged } from 'actions/course';
import * as viewActions from 'actions/view';
import { modalActions } from 'actions/modal';
import { createNewDataSet } from 'actions/analytics';
import { AnalyticsState } from 'reducers/analytics';

interface StateProps {
  analytics: AnalyticsState;
}

interface DispatchProps {
  courseChanged: (model: CourseModel) => void;
  viewAllCourses: () => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onCreateDataset: () => void;
}

interface OwnProps {
  model: CourseModel;
  editMode: boolean;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    analytics: state.analytics,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    courseChanged: (model: CourseModel) =>
      dispatch(courseChanged(model)),
    viewAllCourses: () =>
      dispatch(viewActions.viewAllCourses()),
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
    onCreateDataset: () => dispatch(createNewDataSet()),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CourseEditor);
