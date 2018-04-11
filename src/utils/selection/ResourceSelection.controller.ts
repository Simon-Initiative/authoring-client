import { connect } from 'react-redux';
import { ServerState } from 'reducers/server';
import ResourceSelection from './ResourceSelection';
import * as models from 'data/models';
import * as persistence from '../../data/persistence';
import { Resource } from 'data/content/resource';

interface StateProps {
  serverTimeSkewInMs: number;
  course: models.CourseModel;
}

interface DispatchProps {

}

interface OwnProps {
  onInsert: (item: Resource) => void;
  onCancel: () => void;
  courseId: string;
  filterPredicate: (res: Resource) => boolean;
}

const mapStateToProps = (state): StateProps => {
  const {
    server: { serverTimeSkewInMs },
    course,
  } = state;

  return {
    serverTimeSkewInMs,
    course,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {

  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ResourceSelection);
