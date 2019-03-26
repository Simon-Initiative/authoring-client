import { connect } from 'react-redux';
import OrgEditor from './OrgEditor';
import { OrganizationModel, CourseModel } from 'data/models';
import { AppContext } from 'editors/common/AppContext';
import { undo, redo, documentEditingEnable } from 'actions/document';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import * as Messages from 'types/messages';
import { modalActions } from 'actions/modal';
import * as org from 'data/models/utils/org';

interface StateProps {
  canUndo: boolean;
  canRedo: boolean;
  course: CourseModel;
  model: OrganizationModel;
}

interface DispatchProps {
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onEditingEnable: (editable: boolean, documentId: string) => void;
}

interface OwnProps {
  context: AppContext;
  placements: org.Placements;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    canUndo: false,
    canRedo: false,
    course: state.course,
    model: state.orgs.activeOrg.caseOf({
      just: d => d.model,
      nothing: () => null,
    }),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
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

const connected
  = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(OrgEditor);

export default connected;
