import { connect } from 'react-redux';
import OrgEditor from './OrgEditor';
import { OrganizationModel, CourseModel } from 'data/models';
import { AppContext } from 'editors/common/AppContext';
import { undo, redo, documentEditingEnable } from 'actions/document';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import * as Messages from 'types/messages';
import { modalActions } from 'actions/modal';
import * as org from 'data/models/utils/org';
import { DocumentId } from 'data/types';

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
  onUndo: (documentId: DocumentId) => void;
  onRedo: (documentId: DocumentId) => void;
  onEditingEnable: (editable: boolean, documentId: DocumentId) => void;
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
    onUndo: (documentId: DocumentId) =>
      dispatch(undo(documentId)),
    onRedo: (documentId: DocumentId) =>
      dispatch(redo(documentId)),
    onEditingEnable: (editable: boolean, documentId: DocumentId) =>
      dispatch(documentEditingEnable(editable, documentId)),
  };
};

const connected
  = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(OrgEditor);

export default connected;
