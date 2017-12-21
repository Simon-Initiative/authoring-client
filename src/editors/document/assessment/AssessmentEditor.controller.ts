import { connect } from 'react-redux';
import AssessmentEditor from './AssessmentEditor';
import { fetchSkills } from 'actions/skills';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { AssessmentModel } from 'data/models';

interface StateProps {

}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
}

interface OwnProps extends AbstractEditorProps<AssessmentModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
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
