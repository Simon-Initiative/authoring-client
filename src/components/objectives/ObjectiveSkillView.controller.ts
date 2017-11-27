import { connect } from 'react-redux';
import ObjectiveSkillView from './ObjectiveSkillView';
import { getTitlesByModel, updateTitles } from 'actions/course';
import { CourseModel } from 'data/models';

interface StateProps {
  titles: any;
}

interface DispatchProps {
  onLoadTitles: (courseId: CourseModel) => void;
  onAddTitle: (id: string, title: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

interface OwnProps {
  userName: string;
  course: any;
  dispatch: any;
  expanded: any;
}

const mapStateToProps = (state): StateProps => {
  const { titles } = state;

  return {
    titles: titles.toJS(),
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
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ObjectiveSkillView);
