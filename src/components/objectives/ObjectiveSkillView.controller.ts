import { connect } from 'react-redux';
import { OrderedMap } from 'immutable';
import { Skill, LearningObjective } from 'data/contentTypes';
import ObjectiveSkillView from './ObjectiveSkillView';
import { CourseModel } from 'data/models';
import { setSkills, updateSkills } from 'actions/skills';
import { setObjectives, updateObjectives } from 'actions/objectives';
import * as Messages from 'types/messages';
import { showMessage, dismissSpecificMessage } from 'actions/messages';

interface StateProps {
  skills: any;
}

interface DispatchProps {
  onSetSkills: (skills: OrderedMap<string, Skill>) => void;
  onUpdateSkills: (skills: OrderedMap<string, Skill>) => void;
  onSetObjectives: (objectives: OrderedMap<string, LearningObjective>) => void;
  onUpdateObjectives: (objectives: OrderedMap<string, LearningObjective>) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
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
    onSetObjectives: (objs: OrderedMap<string, LearningObjective>) => {
      dispatch(setObjectives(objs));
    },
    onUpdateObjectives: (objs: OrderedMap<string, LearningObjective>) => {
      dispatch(updateObjectives(objs));
    },
    showMessage: (message: Messages.Message) => {
      dispatch(showMessage(message));
    },
    dismissMessage: (message: Messages.Message) => {
      dispatch(dismissSpecificMessage(message));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ObjectiveSkillView);
