import { connect } from 'react-redux';
import { Map } from 'immutable';
import EditorManager from './EditorManager';
import { courseChanged } from 'actions/course';
import { CourseModel } from 'data/models';
import { UserProfile } from 'types/user';
import { Skill, LearningObjective } from 'data/contentTypes';

interface StateProps {
  expanded: any;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
}

interface DispatchProps {
  onCourseChanged: (model: CourseModel) => any;
  onDispatch: (...args: any[]) => any;
}

interface OwnProps {
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: any;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const { expanded, skills, objectives } = state;

  return {
    expanded,
    skills,
    objectives,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onCourseChanged: (model: CourseModel) => {
      dispatch(courseChanged(model));
    },
    onDispatch: dispatch,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EditorManager);
