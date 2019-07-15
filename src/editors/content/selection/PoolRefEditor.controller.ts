import { connect } from 'react-redux';
import PoolRefEditor from './PoolRefEditor';
import { CourseModel } from 'data/models/course';
import { PoolRef } from 'data/content/assessment/pool_ref';

interface StateProps {
  course: CourseModel;
}

interface DispatchProps {
}

interface OwnProps {
  onRemove: (guid: string) => void;
  model: PoolRef;
  onEdit: (source: any) => void;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    course: state.course,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
  };
};

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps)(PoolRefEditor);

export default connected;
