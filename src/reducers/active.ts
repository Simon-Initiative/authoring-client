import * as Immutable from 'immutable';
import * as actions from 'actions/active';
import * as documentActions from 'actions/document';
import { ActiveContext } from 'types/active';
import { EditedDocument } from 'types/document';
import { Maybe } from 'tsmonad';
import createGuid from 'utils/guid';

export type ActionTypes =
  documentActions.DocumentReleasedAction |
  documentActions.DocumentLoadedAction |
  actions.UpdateContentAction |
  actions.UpdateContextAction;

export type ActiveContextState = ActiveContext;

const initialState = new ActiveContext();

export const activeContext = (
  state: ActiveContextState = initialState,
  action: ActionTypes,
): ActiveContextState => {

  switch (action.type) {
    case actions.UPDATE_CONTENT:
      return state.with({
        activeChild: Maybe.just(action.content),
        documentId: Maybe.just(action.documentId),
      });
    case actions.UPDATE_CONTEXT:
      return state.with({
        activeChild: Maybe.just(action.content),
        container: Maybe.just(action.container),
        documentId: Maybe.just(action.documentId),
      });
    case documentActions.DOCUMENT_RELEASED:
      return state.with({
        activeChild: Maybe.nothing(),
        container: Maybe.nothing(),
        documentId: Maybe.nothing(),
      });
    case documentActions.DOCUMENT_LOADED:
      return state.with({
        activeChild: Maybe.nothing(),
        container: Maybe.nothing(),
        documentId: Maybe.just(action.documentId),
      });

    default:
      return state;
  }
};
