import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { Maybe } from 'tsmonad';
import { EditedDocument } from 'types/document';
import { courseChanged, updateCourseResources } from './course';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as Messages from 'types/messages';
import { showMessage, dismissScopedMessages, dismissSpecificMessage } from './messages';
import { lookUpByName } from 'editors/manager/registry';
import { buildPersistenceFailureMessage, buildReportProblemAction } from 'utils/error';
import { buildLockExpiredMessage, buildReadOnlyMessage } from 'utils/lock';

import { logger, LogTag, LogLevel, LogAttribute, LogStyle } from 'utils/logger';

import { PersistenceStrategy } from 'editors/manager/persistence/PersistenceStrategy';

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
  dispatch(
    dismissSpecificMessage(new Messages.Message().with({ guid: documentId + '_PERSISTENCE' })));
  dispatch(modelUpdated(documentId, document.model));
}

function saveFailed(dispatch, getState, courseId, documentId, error) {

  const message = error === 'Forbedden'
    ? buildLockExpiredMessage({
      label: 'Reload',
      execute: () => dispatch(load(courseId, documentId)) })
    : buildPersistenceFailureMessage(error, getState().user.profile);

  dispatch(showMessage(message.with({ guid: documentId + '_PERSISTENCE' })));
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

export function load(courseId: string, documentId: string) {
  return function (dispatch, getState) {

    const userName = getState().user.profile.userName;

    dispatch(documentRequested(documentId));

    persistence.retrieveDocument(courseId, documentId)
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
        ).then((editingAllowed) => {

          if (!editingAllowed) {

            const lockDetails = strategy.getLockDetails();
            const message = buildReadOnlyMessage(lockDetails, { label: 'Reload',
              execute: () => this.fetchDocument(this.props.course.guid, this.props.documentId)});
            dispatch(showMessage(message));
          } else {
            dispatch(dismissScopedMessages(Messages.Scope.Resource));
          }

          dispatch(documentLoaded(documentId, document, strategy, editingAllowed));

        });
      });
  };
}

export function release(documentId: string) {
  return function (dispatch, getState) {

    const editedDocument: EditedDocument = getState().documents.get(documentId);
    editedDocument.persistence.destroy()
      .then(result => dispatch(documentReleased(documentId)));
  };
}

export function save(documentId: string, model: models.ContentModel) {
  return function (dispatch, getState) {

    const editedDocument : EditedDocument = getState().documents.get(documentId);

    if (editedDocument.document.type === 'Loaded') {

      const model = editedDocument.document.document.model;

      if (model.modelType !== 'CourseModel' && model.modelType !== 'MediaModel') {
        const resource = model.resource.with({ dateUpdated: new Date() });
        const resources = Immutable.OrderedMap<string, Resource>([[resource.guid, resource]]);
        dispatch(updateCourseResources(resources));
      }

      const doc = editedDocument.document.document.with({ model });
      editedDocument.persistence.save(doc);
    }

  };
}

export function undo(documentId: string) {
  return function (dispatch, getState) {

    const editedDocument : EditedDocument = getState().documents.get(documentId);
    const model = editedDocument.undoStack.pop().peek();

    dispatch(save(documentId, model));
    dispatch(changeUndone(documentId));

  };
}

export function redo(documentId: string) {
  return function (dispatch, getState) {

    const editedDocument : EditedDocument = getState().documents.get(documentId);
    const model = editedDocument.redoStack.pop().peek();

    dispatch(save(documentId, model));
    dispatch(changeRedone(documentId));
  };
}
