import { connect } from 'react-redux';
import ConceptView from './ConceptView';
import { getTitle } from 'app/actions/course';
import { Title } from 'app/types/course';

interface StateProps {}

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

const mapStateToProps = (state): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onGetTitle: (courseId: string, conceptId: string, conceptType: string) => {
      return dispatch(getTitle(courseId, conceptId, conceptType));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ConceptView);
