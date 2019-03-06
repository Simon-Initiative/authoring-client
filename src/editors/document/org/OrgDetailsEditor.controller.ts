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
import { change } from 'actions/orgs';

interface StateProps {
  skills: Map<string, t.Skill>;
  objectives: Map<string, t.LearningObjective>;
  model: Maybe<models.OrganizationModel>;
  editMode: boolean;
  course: models.CourseModel;
}

interface DispatchProps {
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  onEdit: (request: org.OrgChangeRequest) => void;
  dispatch: any;
}

interface OwnProps {
}



const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { orgs, course, skills, objectives } = state;

  return {
    skills,
    objectives,
    model: orgs.activeOrg.map(d => d.model as models.OrganizationModel),
    course,
    editMode: course.editable,
  };
};

const mapDispatchToProps = (d: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onEdit: (cr: org.OrgChangeRequest) => {
      d(change(cr) as any);
    },
    showMessage: (message: Messages.Message) => {
      return d(showMessage(message));
    },
    dismissMessage: (message: Messages.Message) => {
      d(dismissSpecificMessage(message));
    },
    dismissModal: () => {
      return d(modalActions.dismiss());
    },
    displayModal: (c) => {
      d(modalActions.display(c));
    },
    dispatch: (a) => {
      d(a);
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgDetailsEditor);

export { controller as OrgDetailsEditor };
