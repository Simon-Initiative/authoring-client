import { connect } from 'react-redux';
import { OrderedMap } from 'immutable';
import { Skill } from 'data/contentTypes';
import ObjectiveSkillView from './ObjectiveSkillView';
import { CourseModel } from 'data/models';
import { setSkills, updateSkills } from 'actions/skills';

interface StateProps {
  skills: any;
}

interface DispatchProps {
  onSetSkills: (skills: OrderedMap<string, Skill>) => void;
  onUpdateSkills: (skills: OrderedMap<string, Skill>) => void;
}

interface OwnProps {
  userName: string;
  course: any;
  dispatch: any;
  expanded: any;
}

const mapStateToProps = (state): StateProps => {
  const { skills } = state;

  return {
    skills,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onSetSkills: (skills: OrderedMap<string, Skill>) => {
      dispatch(setSkills(skills));
    },
    onUpdateSkills: (skills: OrderedMap<string, Skill>) => {
      dispatch(updateSkills(skills));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ObjectiveSkillView);
