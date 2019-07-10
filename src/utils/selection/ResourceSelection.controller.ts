import { connect } from 'react-redux';
import ResourceSelection from './ResourceSelection';
import * as models from 'data/models';
import { Resource } from 'data/content/resource';
import { CourseGuid } from 'data/types';

interface StateProps {
  timeSkewInMs: number;
  course: models.CourseModel;
}

interface DispatchProps {

}

interface OwnProps {
  onInsert: (item: Resource) => void;
  onCancel: () => void;
  courseId: CourseGuid;
  title?: string;
  noResourcesMessage?: string | JSX.Element;
  filterPredicate: (res: Resource) => boolean;
}

const mapStateToProps = (state): StateProps => {
  const {
    server: { timeSkewInMs },
    course,
  } = state;

  return {
    timeSkewInMs,
    course,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {

  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ResourceSelection);
