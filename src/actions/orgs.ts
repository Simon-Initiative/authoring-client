import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as contentTypes from 'data/contentTypes';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as Messages from 'types/messages';
import { showMessage, dismissScopedMessages, dismissSpecificMessage } from 'actions/messages';
import { modalActions } from 'actions/modal';
import { buildPersistenceFailureMessage } from 'utils/error';
import { buildReadOnlyMessage } from 'utils/lock';
import { Maybe } from 'tsmonad';
import { logger, LogTag, LogLevel, LogAttribute, LogStyle } from 'utils/logger';
import { MapFn, map as rawMap } from 'data/utils/map';

import { ConflictModal } from 'components/ConflictModal.controller';
import { State } from 'reducers';
import { ContentElement } from 'data/content/common/interfaces';

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
  return function (dispatch, getState): Promise<persistence.Document> {

    const userName = getState().user.profile.username;

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
    getState().orgs.lift((doc) => {
      persistence.persistRevisionBasedDocument(doc.with({ model }))
        .then((result) => {

        })
        .catch((err) => {

        });
    });

  };

}

