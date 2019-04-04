import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ModuleAnalytics } from './ModuleAnalytics';
import { OrderedMap } from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as models from 'data/models';

interface StateProps {
  objectives: OrderedMap<string, contentTypes.LearningObjective>;
  skills: OrderedMap<string, contentTypes.Skill>;
}

interface DispatchProps {

}

interface OwnProps {
  course: models.CourseModel;
  model: contentTypes.Module;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { objectives, skills } = state;
  return {
    objectives,
    skills,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(ModuleAnalytics);

export { controller as ModuleAnalytics };
