import { connect } from 'react-redux';
import { OrderedMap } from 'immutable';
import { Skill } from 'types/course';
import ObjectiveSkillView from './ObjectiveSkillView';
import { getTitlesByModel, updateTitles } from 'actions/course';
import { CourseModel } from 'data/models';
import { setSkills, updateSkills } from 'actions/skills';

interface StateProps {
  titles: any;
  skills: any;
}

interface DispatchProps {
  onLoadTitles: (courseId: CourseModel) => void;
  onAddTitle: (id: string, title: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
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
  const { titles, skills } = state;

  return {
    titles: titles.toJS(),
    skills,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onLoadTitles: (model: CourseModel) => {
      dispatch(getTitlesByModel(model));
    },
    onAddTitle: (id: string, title: string) => {
      dispatch(updateTitles([{ id, title }]));
    },
    onUpdateTitle: (id: string, title: string) => {
      dispatch(updateTitles([{ id, title }]));
    },
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
