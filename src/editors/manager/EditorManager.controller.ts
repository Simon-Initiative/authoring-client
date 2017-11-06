import { connect } from 'react-redux';
import EditorManager from './EditorManager';
import { courseChanged, fetchObjectiveTitles } from 'actions/course';
import { CourseModel } from 'data/models';
import { UserProfile } from 'types/user';

interface StateProps {
  expanded: any;
  titles: any;
}

interface DispatchProps {
  onCourseChanged: (model: CourseModel) => any;
  onLoadCourseTitles: (courseId: string) => any;
}

interface OwnProps {
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: any;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const { expanded, titles } = state;

  return {
    expanded,
    titles,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onCourseChanged: (model: CourseModel) => {
      dispatch(courseChanged(model));
    },
    onLoadCourseTitles: (courseId) => {
      dispatch(fetchObjectiveTitles(courseId));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EditorManager);
