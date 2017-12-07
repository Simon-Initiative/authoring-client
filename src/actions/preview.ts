import * as persistence from 'data/persistence';
import { CourseModel, ModelTypes, OrganizationModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { Resource } from 'data/contentTypes';

interface MissingFromOrganization {
  type: 'MissingFromOrganization';
  model: OrganizationModel;
}

interface PreviewSuccess {
  type: 'PreviewSuccess';
  url: string;
}

interface UnknownPreviewError {
  type: 'UnknownPreviewError';
  error: string;
}

interface PreviewNotSetUp {
  type: 'PreviewNotSetUp';
}

// The four different results that we can get from attempting to
// preview a resource
export type PreviewResult =
  PreviewNotSetUp |            // Preview may not be set up for this course
  MissingFromOrganization |    // The resource might not be included in the default org
  PreviewSuccess |             // We successfully previewed the resource
  UnknownPreviewError;         // We encountered some unknown problem

// Determine which org is the 'default' org in use by preview
function determineDefaultOrg(model: CourseModel) : Resource {

  // Take the first org that contains "Default" in the title
  const containsDefaultTitle = model.resources
    .toArray()
    .filter(r => r.type === LegacyTypes.organization && r.id.indexOf('default') !== -1);

  if (containsDefaultTitle.length > 0) {
    return containsDefaultTitle[0];
  } else {

    // Or just take the first one.  There is guaranteed to be at least one.
    return model.resources
    .toArray()
    .filter(r => r.type === LegacyTypes.organization)[0];
  }
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
  } else if (node.children) {
    return node.children
      .toArray()
      .some(n => isResourceInOrgHelper(org, resource, n));
  }
}

// The action to invoke preview.
export function preview(resource: Resource) {
  return function (dispatch, getState) : Promise<PreviewResult> {

    const { course } = getState();

    return new Promise((resolve, reject) => {
      fetchOrg(course.guid, determineDefaultOrg(course))
        .then((model) => {
          if (isResourceInOrg(model, resource)) {
            return persistence.initiatePreview(course.guid, resource.guid);
          } else {
            resolve({
              type: 'MissingFromOrganization',
              model,
            });
          }
        })
        .then((result : persistence.PreviewResult) => {

          if (result.type === 'PreviewNotSetUp') {
            resolve({
              type: 'PreviewNotSetUp',
            });
          } else {
            resolve({
              type: 'PreviewSuccess',
              url: result.activityUrl !== undefined ? result.activityUrl : result.sectionUrl,
            });
          }

        })
        .catch((error) => {
          resolve({
            type: 'UnknownPreviewError',
            error,
          });
        });
    });

  };
}
