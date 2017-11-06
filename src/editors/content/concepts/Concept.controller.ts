import { connect } from 'react-redux';
import Concept from './Concept';
import { getTitle } from 'app/actions/course';
import { Title } from 'app/types/course';

interface StateProps {
  title: string;
}

interface DispatchProps {
  onGetTitle: (courseId: string, conceptId: string, conceptType: string) => any;
}

interface OwnProps {
  editMode: boolean;
  conceptId: string;
  conceptType: string;
  courseId: string;
  onRemove: (id: string, type: string) => void;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    title: state.titles.get(ownProps.conceptId),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onGetTitle: (courseId: string, conceptId: string, conceptType: string) => {
      return dispatch(getTitle(courseId, conceptId, conceptType));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Concept);
