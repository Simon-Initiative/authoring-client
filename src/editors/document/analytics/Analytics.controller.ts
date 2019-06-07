import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { Analytics, OrgItem } from './Analytics';
import { OrderedMap } from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as models from 'data/models';
import { push } from 'actions/router';
import { AnalyticsState } from 'reducers/analytics';

export { OrgItem };

interface StateProps {
  analytics: AnalyticsState;
  objectives: OrderedMap<string, contentTypes.LearningObjective>;
  skills: OrderedMap<string, contentTypes.Skill>;
  organization: models.OrganizationModel;
}

interface DispatchProps {
  onPushRoute: (path: string) => void;
}

interface OwnProps {
  course: models.CourseModel;
  model: OrgItem;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  const { analytics, objectives, skills, orgs } = state;
  return {
    analytics,
    objectives,
    skills,
    // we are guaranteed to have an activeOrg when this component loads
    organization: orgs.activeOrg.valueOrThrow().model as models.OrganizationModel,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onPushRoute: path => dispatch(push(path)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(Analytics);

export { controller as Analytics };
