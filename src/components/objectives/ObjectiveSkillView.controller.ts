import { connect } from 'react-redux';
import { OrderedMap } from 'immutable';
import { LearningObjective, Skill } from 'data/contentTypes';
import { ObjectiveSkillView } from './ObjectiveSkillView';
import { fetchSkills, setSkills, updateSkills } from 'actions/skills';
import { setObjectives, updateObjectives } from 'actions/objectives';
import * as Messages from 'types/messages';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import * as lockActions from 'actions/locks';
import { AcquiredLock, RegisterLocks, UnregisterLocks } from 'types/locks';
import { modalActions } from 'actions/modal';
import { push } from 'actions/router';
import { State } from 'reducers';
import { Maybe } from 'tsmonad';
import * as models from 'data/models';

interface StateProps {
  skills: any;
  user: any;
  selectedOrganization: Maybe<models.OrganizationModel>;
}

interface DispatchProps {
  onFetchSkills: (courseId: string) => any;
  onSetSkills: (skills: OrderedMap<string, Skill>) => void;
  onUpdateSkills: (skills: OrderedMap<string, Skill>) => void;
  onSetObjectives: (objectives: OrderedMap<string, LearningObjective>) => void;
  onUpdateObjectives: (objectives: OrderedMap<string, LearningObjective>) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  displayModal: (component: any) => void;
  dismissModal: () => void;
  onPushRoute: (path: string) => void;
  registerLocks: RegisterLocks;
  unregisterLocks: UnregisterLocks;
}

interface OwnProps {
  userName: string;
  course: any;
  dispatch: any;
  expanded: any;
}

const mapStateToProps = (state: State): StateProps => {
  const { skills, user, orgs } = state;

  return {
    skills,
    user,
    selectedOrganization: orgs.activeOrg.lift(doc =>
      (doc.model as models.OrganizationModel)),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {

    onFetchSkills: (courseId: string) => {
      return dispatch(fetchSkills(courseId));
    },
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
    registerLocks: (locks: AcquiredLock[]) => {
      dispatch(lockActions.registerLocks(locks));
    },
    unregisterLocks: (locks: AcquiredLock[]) => {
      dispatch(lockActions.unregisterLocks(locks));
    },
    displayModal: (comp: any) => {
      dispatch(modalActions.display(comp));
    },
    dismissModal: () => {
      dispatch(modalActions.dismiss());
    },
    onPushRoute: path => dispatch(push(path)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(ObjectiveSkillView);

export { controller as ObjectiveSkillView };
