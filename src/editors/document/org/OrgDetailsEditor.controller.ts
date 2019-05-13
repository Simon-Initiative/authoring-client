import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { OrgDetailsEditor } from './OrgDetailsEditor';
import * as models from 'data/models';
import { Maybe } from 'tsmonad';
import * as Messages from 'types/messages';
import * as org from 'data/models/utils/org';
import { Map } from 'immutable';
import * as t from 'data/contentTypes';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import { modalActions } from 'actions/modal';
import { change, undo, redo, releaseOrg } from 'actions/orgs';
import { UserState } from 'reducers/user';


interface StateProps {
  skills: Map<string, t.Skill>;
  objectives: Map<string, t.LearningObjective>;
  model: Maybe<models.OrganizationModel>;
  editMode: boolean;
  course: models.CourseModel;
  placements: org.Placements;
  canUndo: boolean;
  canRedo: boolean;
  user: UserState;
}

interface DispatchProps {
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  onEdit: (request: org.OrgChangeRequest) => void;
  onUndo: () => void;
  onRedo: () => void;
  dispatch: any;
}

interface OwnProps {
}



const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { orgs, course, skills, objectives, user } = state;
  const { requestInFlight } = orgs;

  return {
    skills,
    objectives,
    model: orgs.activeOrg.map(d => d.model as models.OrganizationModel),
    course,
    editMode: course.editable && !requestInFlight,
    placements: orgs.placements,
    canUndo: orgs.undoStack.size > 0 && !requestInFlight,
    canRedo: orgs.redoStack.size > 0 && !requestInFlight,
    user,
  };
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps): DispatchProps => {
  return {
    onEdit: (cr: org.OrgChangeRequest) => {
      dispatch(change(cr) as any);
    },
    showMessage: (message: Messages.Message) => {
      return dispatch(showMessage(message));
    },
    dismissMessage: (message: Messages.Message) => {
      dispatch(dismissSpecificMessage(message));
    },
    dismissModal: () => {
      return dispatch(modalActions.dismiss());
    },
    displayModal: (c) => {
      dispatch(modalActions.display(c));
    },
    dispatch,
    onUndo: () => dispatch(undo() as any),
    onRedo: () => dispatch(redo() as any),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgDetailsEditor);

export { controller as OrgDetailsEditor };
