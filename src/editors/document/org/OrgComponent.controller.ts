import { connect } from 'react-redux';
import { Map } from 'immutable';
import { OrgComponentEditor } from './OrgComponentEditor';
import * as models from 'data/models';
import * as t from 'data/contentTypes';
import { change } from 'actions/orgs';
import { State } from 'reducers';
import * as org from 'data/models/utils/org';
import { dismissSpecificMessage, showMessage } from 'actions/messages';
import * as Messages from 'types/messages';
import { modalActions } from 'actions/modal';
import { Maybe } from 'tsmonad';

interface StateProps {
  skills: Map<string, t.Skill>;
  objectives: Map<string, t.LearningObjective>;
  course: models.CourseModel;
  org: Maybe<models.OrganizationModel>;
}

interface DispatchProps {
  onEdit: (change: org.OrgChangeRequest) => any;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
}

interface OwnProps {
  componentId: string;
  editMode: boolean;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { skills, objectives, course, orgs } = state;
  const org = orgs.activeOrg.map(v => (v.model as models.OrganizationModel));

  return {
    org,
    skills,
    objectives,
    course,
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
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgComponentEditor);
