import { connect } from 'react-redux';
import { Map } from 'immutable';
import EditorManager from './EditorManager';
import { courseChanged, fetchObjectiveTitles } from 'actions/course';
import { CourseModel } from 'data/models';
import { UserProfile } from 'types/user';

interface StateProps {
  expanded: any;
  titles: Map<string, string>;
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
    onDispatch: dispatch,
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(EditorManager);
