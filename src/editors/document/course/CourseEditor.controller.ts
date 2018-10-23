import { connect } from 'react-redux';
import CourseEditor from './CourseEditor';
import { CourseModel } from 'data/models';
import { courseChanged } from 'actions/course';
import * as viewActions from 'actions/view';
import { modalActions } from 'actions/modal';
import { CourseId } from 'data/types';
import { preview } from 'actions/preview';

interface StateProps {

}

interface DispatchProps {
  courseChanged: (model: CourseModel) => void;
  viewAllCourses: () => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onPreview: (courseId: CourseId, organizationId: string, redeploy: boolean) => Promise<any>;
}

interface OwnProps {
  model: CourseModel;
  editMode: boolean;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    courseChanged: (model: CourseModel) =>
      dispatch(courseChanged(model)),
    viewAllCourses: () =>
      dispatch(viewActions.viewAllCourses()),
    onPreview: (courseId: CourseId, organizationId: string, redeploy: boolean) =>
      dispatch(preview(courseId, organizationId, false, redeploy)),
    onDisplayModal: component => dispatch(modalActions.display(component)),
    onDismissModal: () => dispatch(modalActions.dismiss()),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CourseEditor);
