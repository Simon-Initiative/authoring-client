
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import createGuid from 'utils/guid';

export type ORG_REQUESTED = 'orgs/ORG_REQUESTED';
export const ORG_REQUESTED: ORG_REQUESTED = 'orgs/ORG_REQUESTED';

export type OrgRequestedAction = {
  type: ORG_REQUESTED,
  orgId: string,
};

export const orgRequested = (orgId: string): OrgRequestedAction => ({
  type: ORG_REQUESTED,
  orgId,
});


export type ORG_LOADED = 'orgs/ORG_LOADED';
export const ORG_LOADED: ORG_LOADED = 'orgs/ORG_LOADED';

export type OrgLoadedAction = {
  type: ORG_LOADED,
  document: persistence.Document,
};

export const orgLoaded = (
  document: persistence.Document)
  : OrgLoadedAction => ({
    type: ORG_LOADED,
    document,
  });


export type ORG_FAILED = 'orgs/ORG_FAILED';
export const ORG_FAILED: ORG_FAILED = 'orgs/ORG_FAILED';

export type OrgFailedAction = {
  type: ORG_FAILED,
  orgId: string,
  error: string,
};

export const orgFailed = (orgId: string, error: string)
  : OrgFailedAction => ({
    type: ORG_FAILED,
    orgId,
    error,
  });


export type MODEL_UPDATED = 'orgs/MODEL_UPDATED';
export const MODEL_UPDATED: MODEL_UPDATED = 'orgs/MODEL_UPDATED';

export type ModelUpdatedAction = {
  type: MODEL_UPDATED,
  model: models.OrganizationModel,
};

export const modelUpdated = (model: models.OrganizationModel)
  : ModelUpdatedAction => ({
    type: MODEL_UPDATED,
    model,
  });



export function load(courseId: string, organizationId: string) {
  return function (dispatch): Promise<persistence.Document> {

    const holder = { changeMade: false };
    const notifyChangeMade = () => holder.changeMade = true;

    dispatch(orgRequested(organizationId));

    return persistence.retrieveDocument(courseId, organizationId, notifyChangeMade)
      .then((document) => {
        dispatch(orgLoaded(document));
        return document;
      });

  };
}


export function save(model: models.OrganizationModel) {
  return function (dispatch, getState) {

    const nextRevision = createGuid();
    const resource = model.resource.with({
      previousRevisionGuid: model.resource.lastRevisionGuid,
      lastRevisionGuid: nextRevision,
    });
    const nextModel = model.with({ resource });
    dispatch(modelUpdated(nextModel));

    getState().orgs.activeOrg.lift((doc) => {
      persistence.persistRevisionBasedDocument(doc.with({ model }), nextRevision)
        .then((result) => {
          // Nothing to do here
        })
        .catch((err) => {

        });
    });

  };

}

