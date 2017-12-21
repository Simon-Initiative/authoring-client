import { connect } from 'react-redux';
import { Map } from 'immutable';
import EditorManager from './EditorManager';
import { courseChanged } from 'actions/course';
import * as lockActions from 'actions/locks';
import { CourseModel } from 'data/models';
import { UserProfile } from 'types/user';
import { LearningObjective, Skill } from 'data/contentTypes';
import { AcquiredLock, RegisterLocks, UnregisterLocks } from 'types/locks';

interface StateProps {
  expanded: any;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
}

interface DispatchProps {
  onCourseChanged: (model: CourseModel) => any;
  onDispatch: (...args: any[]) => any;
  registerLocks: RegisterLocks;
  unregisterLocks: UnregisterLocks;
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
    registerLocks: (locks: AcquiredLock[]) => {
      dispatch(lockActions.registerLocks(locks));
    },
    unregisterLocks: (locks: AcquiredLock[]) => {
      dispatch(lockActions.unregisterLocks(locks));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EditorManager);
