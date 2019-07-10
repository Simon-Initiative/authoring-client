import * as Immutable from 'immutable';
import * as documentActions from 'actions/document';
import { EditedDocument } from 'types/document';
import createGuid from 'utils/guid';
import { ModelTypes, AssessmentModel, PoolModel } from 'data/models';
import { Maybe } from 'tsmonad';
import * as contentTypes from 'data/contentTypes';

export type ActionTypes =
  documentActions.DocumentEditingEnableAction |
  documentActions.IsSavingUpdatedAction |
  documentActions.LastSaveSucceededAction |
  documentActions.ChangeRedoneAction |
  documentActions.ChangeUndoneAction |
  documentActions.DocumentReleasedAction |
  documentActions.DocumentFailedAction |
  documentActions.DocumentLoadedAction |
  documentActions.DocumentRequestedAction |
  documentActions.ModelUpdatedAction |
  documentActions.SetCurrentNodeOrPageAction;

export type DocumentsState = Immutable.Map<string, EditedDocument>;

const initialState = Immutable.Map<string, EditedDocument>();

function processUndo(
  state: DocumentsState, action: documentActions.ChangeUndoneAction): DocumentsState {

  const ed = state.get(action.documentId.value());
  const model = ed.undoStack.peek();
  const document = ed.document.with({ model });

  const undoStack = ed.undoStack.pop();
  const redoStack = ed.redoStack.push(ed.document.model);

  return state.set(action.documentId.value(), ed.with({
    undoRedoGuid: createGuid(),
    redoStack,
    undoStack,
    document,
  }));
}

function processRedo(
  state: DocumentsState, action: documentActions.ChangeRedoneAction): DocumentsState {

  const ed = state.get(action.documentId.value());

  const model = ed.redoStack.peek();
  const undoStack = ed.undoStack.push(ed.document.model);
  const redoStack = ed.redoStack.pop();

  const document = ed.document.with({ model });

  return state.set(action.documentId.value(), ed.with({
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
  const ed = state.get(action.documentId.value());

  switch (action.type) {

    case documentActions.IS_SAVING_UPDATED:
      if (state.get(action.documentId.value()) !== undefined) {
        return state.set(action.documentId.value(), state.get(action.documentId.value()).with({
          isSaving: action.isSaving,
        }));
      }
      return state;

    case documentActions.LAST_SAVE_SUCEEDED:
      return state.set(action.documentId.value(), state.get(action.documentId.value()).with({
        lastRequestSucceeded: action.lastRequestSucceeded,
        saveCount: state.get(action.documentId.value()).saveCount + 1,
      }));

    case documentActions.DOCUMENT_REQUESTED:
      // Newly requested documents simply get a new record in the map
      return state.set(action.documentId.value(), new EditedDocument()
        .with({ documentId: action.documentId }));

    case documentActions.DOCUMENT_LOADED:
      // Successfully loaded documents have to have their doc set and
      // their persistence strategies initialized
      return state.set(action.documentId.value(), state.get(action.documentId.value()).with({
        document: action.document,
        persistence: action.persistence,
        editingAllowed: action.editingAllowed,
        currentPage: action.document.model.modelType === ModelTypes.AssessmentModel
          ? Maybe.just(action.document.model.pages.first().guid)
          : Maybe.nothing(),
        currentNode: action.document.model.modelType === ModelTypes.AssessmentModel
          ? Maybe.just(action.document.model.pages.first().nodes.first())
          : action.document.model.modelType === ModelTypes.FeedbackModel
            ? Maybe.just(action.document.model.questions.questions.first())
            : Maybe.nothing(),
      }));

    case documentActions.DOCUMENT_FAILED:

      return state.set(action.documentId.value(), state.get(action.documentId.value()).with({
        error: action.error,
        hasFailed: true,
      }));
    case documentActions.DOCUMENT_EDITING_ENABLE:
      return state.set(action.documentId.value(), state.get(action.documentId.value()).with({
        editingAllowed: action.editable,
      }));

    case documentActions.DOCUMENT_RELEASED:
      return state.delete(action.documentId.value());

    case documentActions.CHANGE_REDONE:
      return processRedo(state, action);

    case documentActions.CHANGE_UNDONE:
      return processUndo(state, action);

    case documentActions.MODEL_UPDATED:
      const document = ed.document.with({ model: action.model });
      return state.set(action.documentId.value(), ed.with({
        document,
        undoRedoGuid: createGuid(),
        undoStack: ed.undoStack.push(ed.document.model),
        redoStack: ed.redoStack.clear(),
      }));

    case documentActions.SET_CURRENT_PAGE_OR_NODE:

      // For pools, there are no pages, so just set the node
      if (ed.document.model instanceof PoolModel
        && (!(typeof action.nodeOrPageId === 'string'))) {
        return state.set(action.documentId.value(), ed.with({
          currentNode: Maybe.just(action.nodeOrPageId),
        }));
      }

      const assessment = ed.document.model as AssessmentModel;

      // If we are setting the page and it's a change from the current page,
      // also set the selectedNode as the first node
      if (typeof action.nodeOrPageId === 'string') {
        const selectedPage = action.nodeOrPageId;
        const selectedNode = ed.currentPage.valueOr('') === selectedPage
          ? ed.currentNode
          : assessment.modelType === 'AssessmentModel'
            ? Maybe.just(assessment.pages.get(selectedPage).nodes.first())
            : Maybe.nothing<contentTypes.Node>();
        return state.set(action.documentId.value(), ed.with({
          currentNode: selectedNode,
          currentPage: Maybe.just(selectedPage),
        }));
      }

      // Else we are setting the node, so also set the corresponding page
      const node = action.nodeOrPageId;
      return state.set(action.documentId.value(), ed.with({
        currentNode: Maybe.just(action.nodeOrPageId),
        currentPage: assessment.modelType === 'AssessmentModel'
          ? assessment.pages.reduce(
            (activePage, page: contentTypes.Page) =>
              page.nodes.contains(node) ? Maybe.just(page.guid) : activePage,
            ed.currentPage)
          : Maybe.nothing(),
      }));
    default:
      return state;
  }
};
