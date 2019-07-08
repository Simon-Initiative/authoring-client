import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as contentTypes from 'data/contentTypes';
import { EditedDocument } from 'types/document';
import { courseChanged, updateCourseResources } from 'actions/course';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as Messages from 'types/messages';
import { showMessage, dismissScopedMessages, dismissSpecificMessage } from 'actions/messages';
import { modalActions } from 'actions/modal';
import { lookUpByName } from 'editors/manager/registry';
import { buildPersistenceFailureMessage } from 'utils/error';
import { buildReadOnlyMessage } from 'utils/lock';
import { Maybe } from 'tsmonad';
import { logger, LogTag, LogLevel, LogAttribute, LogStyle } from 'utils/logger';
import { findNodes as findWorkbookNodes } from 'data/models/utils/workbook';
import { findNodes as findAssessmentNodes } from 'data/models/utils/assessment';
import { findNodes as findPoolNodes } from 'data/models/utils/pool';
import { MapFn, map as rawMap } from 'data/utils/map';

import {
  PersistenceStrategy,
  PersistenceState,
} from 'editors/manager/persistence/PersistenceStrategy';
import { WritelockModal } from 'components/WritelockModal.controller';
import { ConflictModal } from 'components/ConflictModal.controller';
import { State } from 'reducers';
import { IdentifiableContentElement, ContentElement } from 'data/content/common/interfaces';
import { CourseIdVers, DocumentId, CourseGuid } from 'data/types';
import { Document } from 'data/persistence/common';

export type DOCUMENT_REQUESTED = 'document/DOCUMENT_REQUESTED';
export const DOCUMENT_REQUESTED: DOCUMENT_REQUESTED = 'document/DOCUMENT_REQUESTED';

export type DocumentRequestedAction = {
  type: DOCUMENT_REQUESTED,
  documentId: DocumentId,
};

export const documentRequested = (documentId: DocumentId): DocumentRequestedAction => ({
  type: DOCUMENT_REQUESTED,
  documentId,
});


export type DOCUMENT_LOADED = 'document/DOCUMENT_LOADED';
export const DOCUMENT_LOADED: DOCUMENT_LOADED = 'document/DOCUMENT_LOADED';

export type DocumentLoadedAction = {
  type: DOCUMENT_LOADED,
  documentId: DocumentId,
  document: persistence.Document,
  persistence: PersistenceStrategy,
  editingAllowed: boolean,
};

export const documentLoaded = (
  documentId: DocumentId, document: persistence.Document,
  persistence: PersistenceStrategy,
  editingAllowed: boolean)
  : DocumentLoadedAction => ({
    type: DOCUMENT_LOADED,
    documentId,
    document,
    persistence,
    editingAllowed,
  });

export type DOCUMENT_EDITING_ENABLE = 'document/DOCUMENT_EDITING_ENABLE';
export const DOCUMENT_EDITING_ENABLE = 'document/DOCUMENT_EDITING_ENABLE';

export type DocumentEditingEnableAction = {
  type: DOCUMENT_EDITING_ENABLE,
  documentId: DocumentId,
  editable: boolean,
};

export function documentEditingEnable(editable: boolean, documentId: DocumentId) {
  return {
    type: DOCUMENT_EDITING_ENABLE,
    editable,
    documentId,
  };
}

export type DOCUMENT_FAILED = 'document/DOCUMENT_FAILED';
export const DOCUMENT_FAILED: DOCUMENT_FAILED = 'document/DOCUMENT_FAILED';

export type DocumentFailedAction = {
  type: DOCUMENT_FAILED,
  documentId: DocumentId,
  error: string,
};

export const documentFailed = (documentId: DocumentId, error: string)
  : DocumentFailedAction => ({
    type: DOCUMENT_FAILED,
    documentId,
    error,
  });


export type MODEL_UPDATED = 'document/MODEL_UPDATED';
export const MODEL_UPDATED: MODEL_UPDATED = 'document/MODEL_UPDATED';

export type ModelUpdatedAction = {
  type: MODEL_UPDATED,
  documentId: DocumentId,
  model: models.ContentModel,
};

export const modelUpdated = (documentId: DocumentId, model: models.ContentModel)
  : ModelUpdatedAction => ({
    type: MODEL_UPDATED,
    documentId,
    model,
  });

export type IS_SAVING_UPDATED = 'document/IS_SAVING_UPDATED';
export const IS_SAVING_UPDATED: IS_SAVING_UPDATED = 'document/IS_SAVING_UPDATED';

export type IsSavingUpdatedAction = {
  type: IS_SAVING_UPDATED,
  documentId: DocumentId,
  isSaving: boolean,
};

export const isSavingUpdated = (documentId: DocumentId, isSaving: boolean)
  : IsSavingUpdatedAction => ({
    type: IS_SAVING_UPDATED,
    documentId,
    isSaving,
  });

export type LAST_SAVE_SUCEEDED = 'document/LAST_SAVE_SUCEEDED';
export const LAST_SAVE_SUCEEDED: LAST_SAVE_SUCEEDED = 'document/LAST_SAVE_SUCEEDED';

export type LastSaveSucceededAction = {
  type: LAST_SAVE_SUCEEDED,
  documentId: DocumentId,
  lastRequestSucceeded: Maybe<boolean>,
};

export const lastSaveSucceeded = (documentId: DocumentId, lastRequestSucceeded: Maybe<boolean>)
  : LastSaveSucceededAction => ({
    type: LAST_SAVE_SUCEEDED,
    documentId,
    lastRequestSucceeded,
  });


export type DOCUMENT_RELEASED = 'document/DOCUMENT_RELEASED';
export const DOCUMENT_RELEASED: DOCUMENT_RELEASED = 'document/DOCUMENT_RELEASED';

export type DocumentReleasedAction = {
  type: DOCUMENT_RELEASED,
  documentId: DocumentId,
};

export const documentReleased = (documentId: DocumentId): DocumentReleasedAction => ({
  type: DOCUMENT_RELEASED,
  documentId,
});


export type CHANGE_UNDONE = 'document/CHANGE_UNDONE';
export const CHANGE_UNDONE: CHANGE_UNDONE = 'document/CHANGE_UNDONE';

export type ChangeUndoneAction = {
  type: CHANGE_UNDONE,
  documentId: DocumentId,
};

export const changeUndone = (documentId: DocumentId): ChangeUndoneAction => ({
  type: CHANGE_UNDONE,
  documentId,
});


export type CHANGE_REDONE = 'document/CHANGE_REDONE';
export const CHANGE_REDONE: CHANGE_REDONE = 'document/CHANGE_REDONE';

export type ChangeRedoneAction = {
  type: CHANGE_REDONE,
  documentId: DocumentId,
};

export const changeRedone = (documentId: DocumentId): ChangeRedoneAction => ({
  type: CHANGE_REDONE,
  documentId,
});

function saveCompleted(
  dispatch, getState: () => State, documentId: DocumentId, document: Document) {

  dispatch(lastSaveSucceeded(documentId, Maybe.just(true)));

  dispatch(
    dismissSpecificMessage(new Messages.Message().with({ guid: documentId + '_PERSISTENCE' })));
}

function saveFailed(
  dispatch, getState, courseId: CourseGuid, documentId: DocumentId,
  error: { status: string, statusText: string, message: string }) {

  dispatch(lastSaveSucceeded(documentId, Maybe.just(false)));

  if (error.statusText === 'Forbidden') {
    // if it is a write-lock failure, disable editing and show write-lock modal
    dispatch(documentEditingEnable(false, documentId));
    dispatch(modalActions.display(React.createElement(WritelockModal, { courseId, documentId })));
  } else if (error.statusText === 'Conflict') {
    // if it is a conflict failure, disable editing and show conflict modal
    dispatch(documentEditingEnable(false, documentId));
    dispatch(modalActions.display(React.createElement(ConflictModal, { courseId, documentId })));
  } else {
    // some other failure, show persistence error message
    const message = buildPersistenceFailureMessage(error.statusText, getState().user.profile);
    dispatch(showMessage(message.with({ guid: documentId + '_PERSISTENCE' })));
  }
}

function stateChangeListener(
  dispatch, getState, courseId: CourseGuid, documentId: DocumentId,
  currentState: PersistenceState) {

  dispatch(isSavingUpdated(documentId, currentState.isInFlight || currentState.isPending));
}

function logResourceDetails(resource: Resource) {

  logger.group(
    LogLevel.INFO,
    LogTag.DEFAULT,
    'Resource Details',
    (logger) => {
      logger
        .setVisibility(LogAttribute.TAG, false)
        .setVisibility(LogAttribute.DATE, false)
        .info(LogTag.DEFAULT, `Type: ${resource.type}`)
        .info(LogTag.DEFAULT, `Title: ${resource.title}`)
        .info(LogTag.DEFAULT, `Created: ${resource.dateCreated}`)
        .info(LogTag.DEFAULT, `Updated: ${resource.dateUpdated}`)
        .info(LogTag.DEFAULT, `Path: ${resource.fileNode.pathTo}`);
    },
    LogStyle.HEADER + LogStyle.BLUE,
  );
}

export function createNew(model: models.ContentModel) {

  return function (dispatch, getState): Promise<persistence.Document> {

    const course = getState().course;

    return new Promise((resolve, reject) => {
      persistence.createDocument(course.guid, model)
        .then((result) => {
          const r = (result as any).model.resource;

          const updated = Immutable.OrderedMap<string, Resource>([[r.guid, r]]);
          dispatch(updateCourseResources(updated));

          resolve(r);
        });
    });
  };
}

export function load(courseId: CourseIdVers, documentId: DocumentId) {
  return function (dispatch, getState): Promise<persistence.Document> {

    const userName = getState().user.profile.username;

    const holder = { changeMade: false };
    const notifyChangeMade = () => holder.changeMade = true;

    dispatch(documentRequested(documentId));

    return persistence.retrieveDocument(courseId, documentId, notifyChangeMade)
      .then((document) => {

        // Notify that the course has changed when a user views a course
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          dispatch(courseChanged(document.model));
        }
        if ((document.model as any).resource !== undefined) {
          logResourceDetails((document.model as any).resource);
        }

        const strategy = lookUpByName(document.model.modelType)
          .persistenceStrategyFactory();

        strategy.initialize(
          document, userName,
          saveCompleted.bind(undefined, dispatch, getState, documentId),
          saveFailed.bind(undefined, dispatch, getState, courseId, documentId),
          stateChangeListener.bind(undefined, dispatch, getState, courseId, documentId),
        ).then((editingAllowed) => {

          if (!editingAllowed) {

            const lockDetails = strategy.getLockDetails();
            const message = buildReadOnlyMessage(lockDetails, {
              label: 'Reload',
              execute: () => this.fetchDocument(this.props.course.guid, this.props.documentId),
            });
            dispatch(showMessage(message));
          } else {
            if (holder.changeMade) {
              strategy.save(document);
            }
            dispatch(dismissScopedMessages(Messages.Scope.Resource));
          }

          dispatch(documentLoaded(documentId, document, strategy, editingAllowed));

        });

        return document;
      });
  };
}

export function releaseAll() {
  return function (dispatch, getState: () => State) {
    const documents: EditedDocument[] = getState().documents.toArray();
    documents.forEach(d => dispatch(release(d.documentId)));
  };
}

export function release(documentId: DocumentId) {
  return function (dispatch, getState: () => State) {
    const editedDocument: EditedDocument = getState().documents.get(documentId.value());
    dispatch(documentReleased(documentId));

    if (editedDocument.persistence !== null) {
      return editedDocument.persistence.destroy();
    }

    return Promise.resolve({});
  };
}

export function mapAndSave(fn: MapFn, documentId: DocumentId) {
  return function (dispatch, getState: () => State) {
    const editedDocument: EditedDocument = getState().documents.get(documentId.value());
    const model = rawMap(fn, ((editedDocument.document.model as any) as ContentElement));
    return dispatch(save(documentId, (model as any) as models.ContentModel));
  };
}


export function save(documentId: DocumentId, model: models.ContentModel, isUndoRedo?: boolean) {
  return function (dispatch, getState: () => State) {

    const editedDocument: EditedDocument = getState().documents.get(documentId.value());

    if (model.modelType !== 'CourseModel' && model.modelType !== 'MediaModel') {
      const resource = model.resource.with({ dateUpdated: new Date() });
      const resources = Immutable.OrderedMap<string, Resource>([[resource.guid, resource]]);
      dispatch(updateCourseResources(resources));
    }

    if (!isUndoRedo) {
      dispatch(modelUpdated(documentId, model));
    }

    const doc = editedDocument.document.with({ model });

    editedDocument.persistence.save(doc);

  };

}

export function undo(documentId: DocumentId) {
  return function (dispatch, getState: () => State) {

    const editedDocument: EditedDocument = getState().documents.get(documentId.value());
    const model = editedDocument.undoStack.peek();

    if (model) {
      dispatch(save(documentId, model, true));
      dispatch(changeUndone(documentId));
    }

  };
}

export function redo(documentId: DocumentId) {
  return function (dispatch, getState: () => State) {

    const editedDocument: EditedDocument = getState().documents.get(documentId.value());
    const model = editedDocument.redoStack.peek();

    if (model) {
      dispatch(save(documentId, model, true));
      dispatch(changeRedone(documentId));
    }
  };
}

export function fetchContentElementById(documentId: DocumentId, elementId: string) {
  return fetchContentElementByPredicate(documentId, e => elementId === e.id);
}


export function fetchContentElementByGuid(documentId: DocumentId, elementId: string) {
  return fetchContentElementByPredicate(documentId, e => elementId === e.guid);
}

export function fetchContentElementByPredicate(documentId: DocumentId, pred) {
  return function (dispatch, getState: () => State): Promise<Maybe<IdentifiableContentElement>> {

    const editedDoc = getState().documents.get(documentId.value());
    const model: models.ContentModel = editedDoc.document.model;

    const toMaybe = (results) => {
      if (results.length === 0) {
        return Maybe.nothing<ContentElement>();
      }
      return Maybe.just(results[0]);
    };

    if (model.modelType === 'WorkbookPageModel') {
      return Promise.resolve(toMaybe(findWorkbookNodes(model, pred)));
    }
    if (model.modelType === 'AssessmentModel') {
      return Promise.resolve(toMaybe(findAssessmentNodes(model, pred)));
    }
    if (model.modelType === 'PoolModel') {
      return Promise.resolve(toMaybe(findPoolNodes(model, pred)));
    }
    return Promise.resolve(Maybe.nothing());
  };
}

export type SET_CURRENT_PAGE_OR_NODE = 'document/SET_CURRENT_PAGE_OR_NODE';
export const SET_CURRENT_PAGE_OR_NODE: SET_CURRENT_PAGE_OR_NODE =
  'document/SET_CURRENT_PAGE_OR_NODE';

export type SetCurrentNodeOrPageAction = {
  type: SET_CURRENT_PAGE_OR_NODE,
  documentId: DocumentId,
  nodeOrPageId: contentTypes.Node | string,
};

export const setCurrentNodeOrPage
  = (documentId: DocumentId, nodeOrPageId: contentTypes.Node | string):
    SetCurrentNodeOrPageAction => ({
      type: SET_CURRENT_PAGE_OR_NODE,
      documentId,
      nodeOrPageId,
    });
