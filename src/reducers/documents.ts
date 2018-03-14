import * as Immutable from 'immutable';
import * as documentActions from 'actions/document';
import { EditedDocument } from 'types/document';
import createGuid from 'utils/guid';

export type ActionTypes =
  documentActions.ChangeRedoneAction |
  documentActions.ChangeUndoneAction |
  documentActions.DocumentReleasedAction |
  documentActions.DocumentFailedAction |
  documentActions.DocumentLoadedAction |
  documentActions.DocumentRequestedAction |
  documentActions.ModelUpdatedAction;


export type DocumentsState = Immutable.Map<string, EditedDocument>;

const initialState = Immutable.Map<string, EditedDocument>();

function processUndo(
  state: DocumentsState, action: documentActions.ChangeUndoneAction) : DocumentsState {

  const ed = state.get(action.documentId);
  const model = ed.undoStack.peek();
  const document = ed.document.with({ model });

  const undoStack = ed.undoStack.pop();
  const redoStack = ed.redoStack.push(ed.document.model);

  return state.set(action.documentId, ed.with({
    undoRedoGuid: createGuid(),
    redoStack,
    undoStack,
    document,
  }));
}

function processRedo(
  state: DocumentsState, action: documentActions.ChangeRedoneAction) : DocumentsState {

  const ed = state.get(action.documentId);

  const model = ed.redoStack.peek();
  const undoStack = ed.undoStack.push(ed.document.model);
  const redoStack = ed.redoStack.pop();

  const document = ed.document.with({ model });

  return state.set(action.documentId, ed.with({
    undoRedoGuid: createGuid(),
    redoStack,
    undoStack,
    document,
  }));
}

export const documents = (
  state: DocumentsState = initialState,
  action: ActionTypes,
): DocumentsState => {

  switch (action.type) {
    case documentActions.DOCUMENT_REQUESTED:
      // Newly requested documents simply get a new record in the map

      return state.set(action.documentId, new EditedDocument()
        .with({ documentId: action.documentId }));

    case documentActions.DOCUMENT_LOADED:

      // Successfully loaded documents have to have their doc set and
      // their persistence strategies initialized
      return state.set(action.documentId, state.get(action.documentId).with({
        document: action.document,
        persistence: action.persistence,
        editingAllowed: action.editingAllowed,
      }));

    case documentActions.DOCUMENT_FAILED:

      return state.set(action.documentId, state.get(action.documentId).with({
        error: action.error,
        hasFailed: true,
      }));

    case documentActions.DOCUMENT_RELEASED:
      return state.delete(action.documentId);

    case documentActions.CHANGE_REDONE:
      return processRedo(state, action);

    case documentActions.CHANGE_UNDONE:
      return processUndo(state, action);

    case documentActions.MODEL_UPDATED:
      const ed = state.get(action.documentId);

      const document = ed.document.with({ model: action.model });
      return state.set(action.documentId, ed.with({
        document,
        undoRedoGuid: createGuid(),
        undoStack: ed.undoStack.push(ed.document.model),
        redoStack: ed.redoStack.clear(),
      }));

    default:
      return state;
  }
};
