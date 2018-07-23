import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as contentTypes from 'data/contentTypes';
import { EditedDocument } from 'types/document';
import { courseChanged, updateCourseResources } from 'actions/course';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as Messages from 'types/messages';
import { showMessage, dismissScopedMessages, dismissSpecificMessage } from 'actions/messages';
import { lookUpByName } from 'editors/manager/registry';
import { buildPersistenceFailureMessage } from 'utils/error';
import { buildLockExpiredMessage, buildReadOnlyMessage } from 'utils/lock';
import { Maybe } from 'tsmonad';
import { logger, LogTag, LogLevel, LogAttribute, LogStyle } from 'utils/logger';

import { PersistenceStrategy,
  PersistenceState } from 'editors/manager/persistence/PersistenceStrategy';

export type DOCUMENT_REQUESTED = 'document/DOCUMENT_REQUESTED';
export const DOCUMENT_REQUESTED: DOCUMENT_REQUESTED = 'document/DOCUMENT_REQUESTED';

export type DocumentRequestedAction = {
  type: DOCUMENT_REQUESTED,
  documentId: string,
};

export const documentRequested = (documentId: string): DocumentRequestedAction => ({
  type: DOCUMENT_REQUESTED,
  documentId,
});


export type DOCUMENT_LOADED = 'document/DOCUMENT_LOADED';
export const DOCUMENT_LOADED: DOCUMENT_LOADED = 'document/DOCUMENT_LOADED';

export type DocumentLoadedAction = {
  type: DOCUMENT_LOADED,
  documentId: string,
  document: persistence.Document,
  persistence: PersistenceStrategy,
  editingAllowed: boolean,
};

export const documentLoaded = (
  documentId: string, document: persistence.Document,
  persistence: PersistenceStrategy,
  editingAllowed: boolean)
: DocumentLoadedAction => ({
  type: DOCUMENT_LOADED,
  documentId,
  document,
  persistence,
  editingAllowed,
});


export type DOCUMENT_FAILED = 'document/DOCUMENT_FAILED';
export const DOCUMENT_FAILED: DOCUMENT_FAILED = 'document/DOCUMENT_FAILED';

export type DocumentFailedAction = {
  type: DOCUMENT_FAILED,
  documentId: string,
  error: string,
};

export const documentFailed = (documentId: string, error: string)
: DocumentFailedAction => ({
  type: DOCUMENT_FAILED,
  documentId,
  error,
});


export type MODEL_UPDATED = 'document/MODEL_UPDATED';
export const MODEL_UPDATED: MODEL_UPDATED = 'document/MODEL_UPDATED';

export type ModelUpdatedAction = {
  type: MODEL_UPDATED,
  documentId: string,
  model: models.ContentModel,
};

export const modelUpdated = (documentId: string, model: models.ContentModel)
  : ModelUpdatedAction => ({
    type: MODEL_UPDATED,
    documentId,
    model,
  });

export type IS_SAVING_UPDATED = 'document/IS_SAVING_UPDATED';
export const IS_SAVING_UPDATED: IS_SAVING_UPDATED = 'document/IS_SAVING_UPDATED';

export type IsSavingUpdatedAction = {
  type: IS_SAVING_UPDATED,
  documentId: string,
  isSaving: boolean,
};

export const isSavingUpdated = (documentId: string, isSaving: boolean)
  : IsSavingUpdatedAction => ({
    type: IS_SAVING_UPDATED,
    documentId,
    isSaving,
  });

export type LAST_SAVE_SUCEEDED = 'document/LAST_SAVE_SUCEEDED';
export const LAST_SAVE_SUCEEDED: LAST_SAVE_SUCEEDED = 'document/LAST_SAVE_SUCEEDED';

export type LastSaveSucceededAction = {
  type: LAST_SAVE_SUCEEDED,
  documentId: string,
  lastRequestSucceeded: Maybe<boolean>,
};

export const lastSaveSucceeded = (documentId: string, lastRequestSucceeded: Maybe<boolean>)
  : LastSaveSucceededAction => ({
    type: LAST_SAVE_SUCEEDED,
    documentId,
    lastRequestSucceeded,
  });


export type DOCUMENT_RELEASED = 'document/DOCUMENT_RELEASED';
export const DOCUMENT_RELEASED: DOCUMENT_RELEASED = 'document/DOCUMENT_RELEASED';

export type DocumentReleasedAction = {
  type: DOCUMENT_RELEASED,
  documentId: string,
};

export const documentReleased = (documentId: string): DocumentReleasedAction => ({
  type: DOCUMENT_RELEASED,
  documentId,
});


export type CHANGE_UNDONE = 'document/CHANGE_UNDONE';
export const CHANGE_UNDONE: CHANGE_UNDONE = 'document/CHANGE_UNDONE';

export type ChangeUndoneAction = {
  type: CHANGE_UNDONE,
  documentId: string,
};

export const changeUndone = (documentId: string): ChangeUndoneAction => ({
  type: CHANGE_UNDONE,
  documentId,
});


export type CHANGE_REDONE = 'document/CHANGE_REDONE';
export const CHANGE_REDONE: CHANGE_REDONE = 'document/CHANGE_REDONE';

export type ChangeRedoneAction = {
  type: CHANGE_REDONE,
  documentId: string,
};

export const changeRedone = (documentId: string): ChangeRedoneAction => ({
  type: CHANGE_REDONE,
  documentId,
});

function saveCompleted(dispatch, getState, documentId, document) {

  dispatch(lastSaveSucceeded(documentId, Maybe.just(true)));

  dispatch(
    dismissSpecificMessage(new Messages.Message().with({ guid: documentId + '_PERSISTENCE' })));
}

function saveFailed(dispatch, getState, courseId, documentId, error) {

  dispatch(lastSaveSucceeded(documentId, Maybe.just(false)));

  const message = error === 'Forbidden'
    ? buildLockExpiredMessage({
      label: 'Reload',
      execute: () => dispatch(load(courseId, documentId)) })
    : buildPersistenceFailureMessage(error, getState().user.profile);

  dispatch(showMessage(message.with({ guid: documentId + '_PERSISTENCE' })));
}

function stateChangeListener(
  dispatch, getState, courseId, documentId, currentState: PersistenceState) {

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

  return function (dispatch, getState) : Promise<persistence.Document> {

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

export function load(courseId: string, documentId: string) {
  return function (dispatch, getState) : Promise<any> {

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
            const message = buildReadOnlyMessage(lockDetails, { label: 'Reload',
              execute: () => this.fetchDocument(this.props.course.guid, this.props.documentId)});
            dispatch(showMessage(message));
          } else {
            if (holder.changeMade) {
              strategy.save(document);
            }
            dispatch(dismissScopedMessages(Messages.Scope.Resource));
          }

          dispatch(documentLoaded(documentId, document, strategy, editingAllowed));

        });
      });
  };
}

export function releaseAll() {
  return function (dispatch, getState) {
    const documents : EditedDocument[] = getState().documents.toArray();
    documents.forEach(d => dispatch(release(d.documentId)));
  };
}

export function release(documentId: string) {
  return function (dispatch, getState) {
    const editedDocument: EditedDocument = getState().documents.get(documentId);
    dispatch(documentReleased(documentId));

    editedDocument.persistence.destroy();
  };
}

export function save(documentId: string, model: models.ContentModel, isUndoRedo?: boolean) {
  return function (dispatch, getState) {

    const editedDocument : EditedDocument = getState().documents.get(documentId);

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

export function undo(documentId: string) {
  return function (dispatch, getState) {

    const editedDocument : EditedDocument = getState().documents.get(documentId);
    const model = editedDocument.undoStack.peek();

    if (model) {
      dispatch(save(documentId, model, true));
      dispatch(changeUndone(documentId));
    }

  };
}

export function redo(documentId: string) {
  return function (dispatch, getState) {

    const editedDocument : EditedDocument = getState().documents.get(documentId);
    const model = editedDocument.redoStack.peek();

    if (model) {
      dispatch(save(documentId, model, true));
      dispatch(changeRedone(documentId));
    }
  };
}

export type SET_CURRENT_PAGE = 'document/SET_CURRENT_PAGE';
export const SET_CURRENT_PAGE: SET_CURRENT_PAGE = 'document/SET_CURRENT_PAGE';

export type SetCurrentPageAction = {
  type: SET_CURRENT_PAGE,
  documentId: string,
  page: string,
};

export const setCurrentPage = (documentId: string, page: string): SetCurrentPageAction => ({
  type: SET_CURRENT_PAGE,
  documentId,
  page,
});

export type SET_CURRENT_NODE = 'document/SET_CURRENT_NODE';
export const SET_CURRENT_NODE: SET_CURRENT_NODE = 'document/SET_CURRENT_NODE';

export type SetCurrentNodeAction = {
  type: SET_CURRENT_NODE,
  documentId,
  node: contentTypes.Node,
};

export const setCurrentNode
  = (documentId: string, node: contentTypes.Node): SetCurrentNodeAction => ({
    type: SET_CURRENT_NODE,
    documentId,
    node,
  });
