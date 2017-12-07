import * as persistence from 'data/persistence';
import { CourseModel, ModelTypes, OrganizationModel } from 'data/models';
import { LegacyTypes } from 'data/types';
import { Resource } from 'data/contentTypes';
import * as Immutable from 'immutable';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { viewDocument } from './view';
import { fetchSkills } from './skills';
import { fetchObjectives } from './objectives';
import { PLACEHOLDER_ITEM_ID } from '../data/content/org/common';
import { configuration } from './utils/config';
import { dismissScopedMessages } from './messages';
import { Scope } from 'types/messages';


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

export type PreviewResult =
  PreviewNotSetUp |
  MissingFromOrganization |
  PreviewSuccess |
  UnknownPreviewError;


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

function fetchOrg(courseId: string, resource: Resource) : Promise<OrganizationModel> {
  return persistence.retrieveDocument(courseId, resource.guid)
    .then(doc => doc.model as OrganizationModel);
}

function isResourceInOrg(org: OrganizationModel, resource: Resource) : boolean {
  return org.sequences.children
    .toArray()
    .some(n => isResourceInOrgHelper(org, resource, n));
}


function isResourceInOrgHelper(org: OrganizationModel, resource: Resource, node) : boolean {
  if (node.contentType === 'Item') {
    return node.resourceref.idref === resource.id;
  } else if (node.children) {
    return node.children
      .toArray()
      .some(n => isResourceInOrgHelper(org, resource, n));
  }
}

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
