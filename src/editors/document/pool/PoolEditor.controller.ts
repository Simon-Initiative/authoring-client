import { connect } from 'react-redux';
import { OrderedMap } from 'immutable';
import PoolEditor from './PoolEditor';
import { fetchSkills } from 'actions/skills';
import { Skill } from 'types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { PoolModel } from 'data/models';

interface StateProps {
  skills: OrderedMap<string, Skill>;
}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
}

interface OwnProps extends AbstractEditorProps<PoolModel> {}

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
  (mapStateToProps, mapDispatchToProps)(PoolEditor);
