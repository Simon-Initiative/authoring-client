import { connect } from 'react-redux';
import * as Immutable from 'immutable';

import WorkbookPageEditor from './WorkbookPageEditor';
import { fetchObjectives } from 'actions/objectives';
import { Title } from 'types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel, OrganizationModel } from 'data/models';
import { Resource } from 'data/contentTypes';
import { preview, PreviewResult } from 'actions/preview';
import * as Messages from 'types/messages';
import * as viewActions from 'actions/view';
import { buildFeedbackFromCurrent } from 'utils//feedback';
import { showMessage } from 'actions/messages';

interface StateProps {

}

interface DispatchProps {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    fetchObjectives: (courseId: string) => {
      return dispatch(fetchObjectives(courseId));
    },
    preview: (courseId: string, resource: Resource) => {
      return runPreview(dispatch, courseId, resource);
    },
  };
};



function runPreview(dispatch, courseId: string, resource: Resource) : Promise<any> {
  return new Promise((resolve, reject) => {
    dispatch(preview(resource))
      .then((result: PreviewResult) => {
        if (result.type === 'MissingFromOrganization') {
          const message = buildMissingFromOrgMessage(courseId, result.model);
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewNotSetUp') {
          const message = buildNotSetUpMessage();
          dispatch(showMessage(message));
        } else if (result.type === 'UnknownPreviewError') {
          const message = buildUnknownErrorMessage(result.error);
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewSuccess') {
          window.open(result.url, 'PreviewTab');
        }

        resolve(true);

      });
  });
}


function buildEditOrgAction(
  courseId: string, label: string, model: OrganizationModel) : Messages.MessageAction {
  return {
    label,
    execute: (message: Messages.Message, dispatch) => {
      dispatch(viewActions.viewDocument(model.resource.guid, courseId));
    },
  };
}

function buildMissingFromOrgMessage(courseId, model: OrganizationModel) {

  const actions = [buildEditOrgAction(courseId, 'Edit Org', model)];

  const content = new Messages.TitledContent().with({
    title: 'Cannot preview.',
    message: 'The page is missing from the default organization.'
      + ' Click \'Edit Org\' to edit this organization',
  });
  return new Messages.Message().with({
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: true,
    actions: Immutable.List(actions),
    content,
  });

}


function buildNotSetUpMessage() {

  const actions = [];

  const content = new Messages.TitledContent().with({
    title: 'Preview not enabled.',
    message: 'Contact support to enable preview for this course package',
  });
  return new Messages.Message().with({
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: true,
    actions: Immutable.List(actions),
    content,
  });

}


function buildReportProblemAction() : Messages.MessageAction {

  const url = buildFeedbackFromCurrent(
    '',
    '',
  );

  return {
    label: 'Report Problem',
    execute: (message, dispatch) => {
      window.open(url, 'ReportProblemTab');
    },
  };
}


function buildUnknownErrorMessage(error: string) {

  const actions = [buildReportProblemAction()];

  const content = new Messages.TitledContent().with({
    title: 'Cannot preview',
    message: 'An error was encountered trying to preview this page.'
      + ' Try again and if the problem persists contact support.',
  });
  return new Messages.Message().with({
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Error,
    canUserDismiss: true,
    actions: Immutable.List(actions),
    content,
  });

}


export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
