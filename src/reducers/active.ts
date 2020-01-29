import * as actions from 'actions/active';
import * as documentActions from 'actions/document';
import { ActiveContext } from 'types/active';
import { Maybe } from 'tsmonad';

export type ActionTypes =
  documentActions.DocumentReleasedAction |
  documentActions.DocumentLoadedAction |
  documentActions.ChangeUndoneAction |
  documentActions.ChangeRedoneAction |
  actions.SelectInlineAction |
  actions.UpdateEditorAction |
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
    case actions.SELECT_INLINE:
      return state.with({
        activeInline: action.inline,
      });

    case actions.UPDATE_EDITOR:
      return state.with({
        activeInline: Maybe.nothing(),
        editor: Maybe.maybe(action.editor),
      });

    case actions.UPDATE_CONTENT:
      return state.with({
        activeChild: Maybe.maybe(action.content),
        documentId: Maybe.just(action.documentId),
      });

    case actions.UPDATE_CONTEXT:
      return state.with({
        activeChild: Maybe.maybe(action.content),
        container: Maybe.maybe(action.container),
        documentId: Maybe.just(action.documentId),
      });

    case documentActions.DOCUMENT_RELEASED:
      return new ActiveContext();

    case documentActions.DOCUMENT_LOADED:
      return new ActiveContext({
        documentId: Maybe.just(action.documentId),
      });

    case actions.RESET_ACTIVE:
    case documentActions.CHANGE_UNDONE:
    case documentActions.CHANGE_REDONE:
      return state.with({
        activeInline: Maybe.nothing(),
        activeChild: Maybe.nothing(),
        container: Maybe.nothing(),
      });

    default:
      return state;
  }
};
