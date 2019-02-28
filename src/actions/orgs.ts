
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import * as org from 'data/models/utils/org';
import createGuid from 'utils/guid';
import { NavigationItem } from 'types/navigation';


export type CHANGE_SELECTED_ITEM = 'orgs/CHANGE_SELECTED_ITEM';
export const CHANGE_SELECTED_ITEM: CHANGE_SELECTED_ITEM = 'orgs/CHANGE_SELECTED_ITEM';

export type ChangeSelectedItemAction = {
  type: CHANGE_SELECTED_ITEM,
  selectedItem: NavigationItem,
};

export const changeSelectedItem = (selectedItem: NavigationItem): ChangeSelectedItemAction => ({
  type: CHANGE_SELECTED_ITEM,
  selectedItem,
});



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


export type ORG_CHANGE_FAILED = 'orgs/ORG_CHANGE_FAILED';
export const ORG_CHANGE_FAILED: ORG_CHANGE_FAILED = 'orgs/ORG_CHANGE_FAILED';

export type OrgChangeFailedAction = {
  type: ORG_CHANGE_FAILED,
  orgId: string,
  error: string,
};

export const orgChangeFailed = (orgId: string, error: string)
  : OrgChangeFailedAction => ({
    type: ORG_CHANGE_FAILED,
    orgId,
    error,
  });


export type ORG_CHANGE_SUCCEEDED = 'orgs/ORG_CHANGE_SUCCEEDED';
export const ORG_CHANGE_SUCCEEDED: ORG_CHANGE_SUCCEEDED = 'orgs/ORG_CHANGE_SUCCEEDED';

export type OrgChangeSucceededAction = {
  type: ORG_CHANGE_SUCCEEDED,
  orgId: string,
};

export const orgChangeSucceeded = (orgId: string)
  : OrgChangeSucceededAction => ({
    type: ORG_CHANGE_SUCCEEDED,
    orgId,
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

function applyChange(
  dispatch,
  doc: persistence.Document,
  courseId: string,
  change: org.OrgChangeRequest,
  retriesRemaining: number) {

  // Attempt to apply the change
  const m = doc.model as models.OrganizationModel;
  org.applyChange(m, change).lift((model) => {

    // Assume this is going to be accepted by the server, so
    // setup our next model revision points appropriately
    const nextRevision = createGuid();
    const resource = m.resource.with({
      previousRevisionGuid: m.resource.lastRevisionGuid,
      lastRevisionGuid: nextRevision,
    });

    dispatch(modelUpdated(m.with({ resource })));

    persistence.persistRevisionBasedDocument(doc.with({ model }), nextRevision)
      .then(() => {
        dispatch(orgChangeSucceeded(doc.model.guid));
      })
      .catch((err) => {

        // When the server rejects our change due to a conflict, we always
        // request the latest view of the document:
        if (err === 'Conflict') {
          persistence.retrieveDocument(courseId, doc.model.guid, () => { })
            .then((latestDoc) => {

              // If we have retry attempts remaining, then try applying the change
              // again.
              if (retriesRemaining > 0) {
                applyChange(dispatch, latestDoc, courseId, change, retriesRemaining - 1);
              } else {
                // If no retry attempts remaining, we simply update the model to reflect
                // the latest from the server's perspective.
                // Track that this change failed
                dispatch(orgChangeFailed(doc.model.guid, err));
                dispatch(modelUpdated(latestDoc.model as models.OrganizationModel));
              }
            });
        } else {
          dispatch(orgChangeFailed(doc.model.guid, err));
        }
      });

  });

}

export function change(change: org.OrgChangeRequest) {
  return function (dispatch, getState) {

    getState().orgs.activeOrg.lift((doc) => {
      const courseId = getState().course.guid;
      applyChange(dispatch, doc, courseId, change, 1);
    });
  };

}

