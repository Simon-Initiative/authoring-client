import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import { CourseModel, OrganizationModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { Resource } from 'data/contentTypes';
import * as Messages from 'types/messages';
import * as viewActions from 'actions/view';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { showMessage } from 'actions/messages';


// Determine which org is the 'default' org in use by preview
function determineDefaultOrg(model: CourseModel) : Resource {

  // Take the first org that contains "Default" in the title
  const containsDefaultTitle = model.resources
    .toArray()
    .filter(r => r.type === LegacyTypes.organization && r.id.indexOf('default') !== -1);

  if (containsDefaultTitle.length > 0) {
    return containsDefaultTitle[0];
  }
  // Or just take the first one.  There is guaranteed to be at least one.
  return model.resources
  .toArray()
  .filter(r => r.type === LegacyTypes.organization)[0];
}

// Retrieve the org model from server
function fetchOrg(courseId: string, resource: Resource) : Promise<OrganizationModel> {
  return persistence.retrieveDocument(courseId, resource.guid)
    .then(doc => doc.model as OrganizationModel);
}

// Determine if a resource is present as an Item in this org
function isResourceInOrg(org: OrganizationModel, resource: Resource) : boolean {
  return org.sequences.children
    .toArray()
    .some(n => isResourceInOrgHelper(org, resource, n));
}

// Recursive helper
function isResourceInOrgHelper(org: OrganizationModel, resource: Resource, node) : boolean {
  if (node.contentType === 'Item') {
    return node.resourceref.idref === resource.id;
  }
  if (node.children) {
    return node.children
      .toArray()
      .some(n => isResourceInOrgHelper(org, resource, n));
  }
  return false;
}

// The action to invoke preview.
function invokePreview(resource: Resource) {
  return function (dispatch, getState) : Promise<persistence.PreviewResult> {

    const { course } = getState();

    return new Promise((resolve, reject) => {
      fetchOrg(course.guid, determineDefaultOrg(course))
        .then((model) => {
          if (isResourceInOrg(model, resource)) {
            return persistence.initiatePreview(course.guid, resource.guid);
          }
          resolve({
            message: 'missing',
            type: 'MissingFromOrganization',
          });
        })
        .then((result : persistence.PreviewResult) => {
          resolve(result);
        })
        .catch((error) => {
          resolve({
            message: 'not set up',
            type: 'PreviewNotSetUp',
          });
        });
    });

  };
}

export function preview(courseId: string, resource: Resource) {

  return function (dispatch) : Promise<any> {

    return dispatch(invokePreview(resource))
      .then((result: persistence.PreviewResult) => {
        if (result.type === 'MissingFromOrganization') {
          const message = buildMissingFromOrgMessage(courseId);
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewNotSetUp') {
          const message = buildNotSetUpMessage();
          dispatch(showMessage(message));
        } else if (result.type === 'PreviewSuccess') {
          window.open('/#preview?url=' + encodeURIComponent(result.activityUrl), courseId);
        } else if (result.type === 'PreviewPending') {
          window.open('/#preview' + resource.guid + '-' + courseId, courseId);
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
