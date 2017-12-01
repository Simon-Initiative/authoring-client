import { connect } from 'react-redux';
import { OrderedMap } from 'immutable';
import AssessmentEditor from './AssessmentEditor';
import { fetchSkills } from 'actions/skills';
import { Title, Skill } from 'types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { AssessmentModel } from 'data/models';

interface StateProps {
  skills: OrderedMap<string, Skill>;
}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
}

interface OwnProps extends AbstractEditorProps<AssessmentModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const { skills } = state;

  return {
    skills,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onFetchSkills: (courseId: string) => {
      return dispatch(fetchSkills(courseId));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(AssessmentEditor);
