import { connect } from 'react-redux';
import CourseEditor from './CourseEditor';
import { CourseModel } from 'data/models';
import { courseChanged } from 'actions/course';
import * as viewActions from 'actions/view';

interface StateProps {

}

interface DispatchProps {
  courseChanged: (model: CourseModel) => void;
  viewAllCourses: () => void;
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
    courseChanged: (model: CourseModel) => {
      dispatch(courseChanged(model));
    },
    viewAllCourses: () => {
      dispatch(viewActions.viewAllCourses());
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CourseEditor);
