import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import { CourseModel, OrganizationModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { Resource } from 'data/contentTypes';
import * as Messages from 'types/messages';
import * as viewActions from 'actions/view';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { showMessage } from 'actions/messages';

export function preview(courseId: string, resource: Resource) {

  return function (dispatch) : Promise<any> {

    return persistence.initiatePreview(courseId, resource.guid)
      .then((result: persistence.PreviewResult) => {
        if (result.type === 'MissingFromOrganization') {
          const message = buildMissingFromOrgMessage(courseId);
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewNotSetUp') {
          const message = buildNotSetUpMessage();
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewSuccess') {
          window.open('/#preview?url=' + encodeURIComponent(result.activityUrl), 'PreviewTab');
        } else if (result.type === 'PreviewPending') {
          window.open('/#preview' + resource.guid + '+' + courseId, 'PreviewTab');
        }
      }).catch((err) => {
        const message = buildUnknownErrorMessage(err);
        dispatch(showMessage(message));
      });
  };

}


function buildEditOrgAction(
  courseId: string, label: string) : Messages.MessageAction {
  return {
    label,
    execute: (message: Messages.Message, dispatch) => {
      dispatch(viewActions.viewOrganizations(courseId));
    },
  };
}

function buildMissingFromOrgMessage(courseId) {

  const actions = [buildEditOrgAction(courseId, 'Edit Org')];

  const content = new Messages.TitledContent().with({
    title: 'Cannot preview.',
    message: 'The page is not present in any organization.'
      + ' Click \'Edit Org\' to add to an organization',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: true,
    actions: Immutable.List(actions),
  });

}

function buildNotSetUpMessage() {

  const actions = [];

  const content = new Messages.TitledContent().with({
    title: 'Preview not enabled.',
    message: 'Contact support to enable preview for this course package',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: true,
    actions: Immutable.List(actions),
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
    content,
    guid: 'PreviewProblem',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Error,
    canUserDismiss: true,
    actions: Immutable.List(actions),
  });

}
