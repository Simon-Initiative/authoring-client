import { connect } from 'react-redux';
import CourseEditor from './CourseEditor';
import { CourseModel } from 'data/models';
import { courseChanged } from 'actions/course';
import * as viewActions from 'actions/view';
import { Resource } from 'data/contentTypes';
import { preview } from 'actions/preview';
import { CourseId } from 'data/types';

interface StateProps {

}

interface DispatchProps {
  courseChanged: (model: CourseModel) => void;
  viewAllCourses: () => void;
  onPreview: (courseId: string) => Promise<any>;
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
    onPreview: (courseId: CourseId) =>
      dispatch(preview(courseId, false)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CourseEditor);
