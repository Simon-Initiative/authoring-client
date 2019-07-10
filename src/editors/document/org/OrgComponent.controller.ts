import { connect } from 'react-redux';
import { Map } from 'immutable';
import { OrgComponentEditor } from './OrgComponentEditor';
import * as models from 'data/models';
import * as t from 'data/contentTypes';
import { State } from 'reducers';
import * as org from 'data/models/utils/org';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import * as Messages from 'types/messages';
import { modalActions } from 'actions/modal';
import { Maybe } from 'tsmonad';
import { change, undo, redo } from 'actions/orgs';

interface StateProps {
  skills: Map<string, t.Skill>;
  objectives: Map<string, t.LearningObjective>;
  org: Maybe<models.OrganizationModel>;
  placements: org.Placements;
  canUndo: boolean;
  canRedo: boolean;
  editMode: boolean;
}

interface DispatchProps {
  onEdit: (change: org.OrgChangeRequest) => any;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  onDispatch: (a) => void;
  onUndo: () => void;
  onRedo: () => void;
}

interface OwnProps {
  course: models.CourseModel;
  componentId: string;
  editMode: boolean;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { skills, objectives, orgs } = state;
  const org = orgs.activeOrg.map(v => (v.model as models.OrganizationModel));
  const { undoStack, redoStack, requestInFlight } = orgs;

  // If a request is in flight, do not allow editing
  const editMode = ownProps.editMode && !requestInFlight;
  const canUndo = undoStack.size > 0 && !requestInFlight;
  const canRedo = redoStack.size > 0 && !requestInFlight;

  const placements = orgs.placements;

  return {
    org,
    skills,
    objectives,
    canUndo,
    canRedo,
    placements,
    editMode,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onEdit: (request: org.OrgChangeRequest) => {
      dispatch(change(request));
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
    onDispatch: (a) => {
      dispatch(a);
    },
    onUndo: () => dispatch(undo() as any),
    onRedo: () => dispatch(redo() as any),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgComponentEditor);
