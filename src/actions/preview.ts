import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import { Resource } from 'data/contentTypes';
import * as Messages from 'types/messages';
import * as viewActions from 'actions/view';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { showMessage } from 'actions/messages';
import { OrganizationModel } from 'data/models';


// Invoke a preview for the entire course by setting up the course package in OLI
function invokePreview(orgId: string, isRefreshAttempt: boolean) {
  return function (dispatch, getState): Promise<persistence.PreviewResult> {

    const { course } = getState();

    return persistence.initiatePreview(course.guid, orgId, isRefreshAttempt);
  };
}

export function preview(
  courseId: string, organization: OrganizationModel, isRefreshAttempt: boolean) {

  return function (dispatch): Promise<any> {

    return dispatch(invokePreview(organization.id, isRefreshAttempt))
      .then((result: persistence.PreviewResult) => {
        if (result.type === 'MissingFromOrganization') {
          const message = buildMissingFromOrgMessage(courseId);
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewNotSetUp') {
          const message = buildNotSetUpMessage();
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewSuccess') {
          const refresh = result.message === 'pending';
          window.open(
            '/#preview' + organization.guid + '-' + courseId
            + '?url=' + encodeURIComponent(result.activityUrl || result.sectionUrl)
            + (refresh ? '&refresh=true' : ''),
            courseId);
        } else if (result.type === 'PreviewPending') {
          window.open('/#preview' + organization.guid + '-' + courseId, courseId);
        }
      }).catch((err) => {
        const message = buildUnknownErrorMessage(err);
        dispatch(showMessage(message));
      });
  };

}

// Invoke a preview for the current resource (ie Workbook Page) from the editor.
// The full course is not built in OLI
function invokeQuickPreview(resource: Resource) {
  return function (dispatch, getState): Promise<{}> {
    const { course } = getState();

    return persistence.initiateQuickPreview(course.guid, resource.guid);
  };
}

export function quickPreview(courseId: string, resource: Resource) {

  return function (dispatch): Promise<any> {

    return dispatch(invokeQuickPreview(resource))
      .then((result) => {
        window.open('/#quick_preview/' + resource.guid + '-' + courseId, '_blank');
      }).catch((err) => {
        console.log('err');
        const message = buildUnknownErrorMessage(err);
        dispatch(showMessage(message));
      });
  };
}

function buildEditOrgAction(
  courseId: string, label: string): Messages.MessageAction {
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
    message: 'Page not included in any organization.'
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


function buildReportProblemAction(): Messages.MessageAction {

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
