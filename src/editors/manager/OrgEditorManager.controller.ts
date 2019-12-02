import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Document } from 'data/persistence';
import OrgEditorManager from './OrgEditorManager';
import { UserProfile } from 'types/user';
import { LearningObjective, Skill } from 'data/contentTypes';
import { change } from 'actions/orgs';
import { State } from 'reducers';
import * as org from 'data/models/utils/org';
import { CourseModel } from 'data/models';
import { undo, redo, documentEditingEnable } from 'actions/document';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import * as Messages from 'types/messages';
import { modalActions } from 'actions/modal';
import { Maybe } from 'tsmonad';
import { NavigationItem } from 'types/navigation';

interface StateProps {
  expanded: any;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
  document: Document;
  undoRedoGuid: string;
  undoRedoActionGuid: string;
  editingAllowed: boolean;
  hasFailed: boolean;
  canUndo: boolean;
  canRedo: boolean;
  placements: org.Placements;
}

interface DispatchProps {
  onChange: (change: org.OrgChangeRequest) => any;
  onDispatch: (...args: any[]) => any;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onEditingEnable: (editable: boolean, documentId: string) => void;
}

interface OwnProps {
  course: CourseModel;
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  selectedItem: Maybe<NavigationItem>;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { expanded, skills, objectives, orgs } = state;

  let document = null;
  let undoRedoGuid = 'Loading';
  let undoRedoActionGuid = 'Loading';
  let editingAllowed = ownProps.course.editable;
  let hasFailed = false;

  document = orgs.activeOrg.caseOf({
    just: o => o,
    nothing: () => null,
  });
  undoRedoGuid = '';
  undoRedoActionGuid = '';
  editingAllowed = ownProps.course.editable;
  hasFailed = false;

  return {
    expanded,
    skills,
    objectives,
    document,
    undoRedoGuid,
    undoRedoActionGuid,
    editingAllowed,
    hasFailed,
    canUndo: false,
    canRedo: false,
    placements: orgs.placements,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onChange: (request: org.OrgChangeRequest) => {
      dispatch(change(request));
    },
    onDispatch: dispatch,
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
    onUndo: (documentId: string) =>
      dispatch(undo(documentId)),
    onRedo: (documentId: string) =>
      dispatch(redo(documentId)),
    onEditingEnable: (editable, documentId) =>
      dispatch(documentEditingEnable(editable, documentId)),
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgEditorManager);
