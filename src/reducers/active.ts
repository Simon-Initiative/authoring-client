import * as actions from 'actions/active';
import * as documentActions from 'actions/document';
import { ActiveContext } from 'types/active';
import { Maybe } from 'tsmonad';

export type ActionTypes =
  documentActions.DocumentReleasedAction |
  documentActions.DocumentLoadedAction |
  actions.UpdateContentAction |
  actions.UpdateContextAction |
  actions.ResetActiveAction;

export type ActiveContextState = ActiveContext;

const initialState = new ActiveContext();

export const activeContext = (
  state: ActiveContextState = initialState,
  action: ActionTypes,
): ActiveContextState => {

  switch (action.type) {
    case actions.UPDATE_CONTENT:
      return state.with({
        activeChild: action.content === null || action.content === undefined
          ? Maybe.nothing() : Maybe.just(action.content),
        documentId: Maybe.just(action.documentId),
      });
    case actions.UPDATE_CONTEXT:
      return state.with({
        activeChild: action.content === null || action.content === undefined
          ? Maybe.nothing() : Maybe.just(action.content),
        container: Maybe.just(action.container),
        documentId: Maybe.just(action.documentId),
        textSelection: action.textSelection,
      });
    case documentActions.DOCUMENT_RELEASED:
      return state.with({
        activeChild: Maybe.nothing(),
        container: Maybe.nothing(),
        documentId: Maybe.nothing(),
        textSelection: Maybe.nothing(),
      });
    case documentActions.DOCUMENT_LOADED:
      return state.with({
        activeChild: Maybe.nothing(),
        container: Maybe.nothing(),
        documentId: Maybe.just(action.documentId),
        textSelection: Maybe.nothing(),
      });
    case actions.RESET_ACTIVE:
      return new ActiveContext();

    default:
      return state;
  }
};
