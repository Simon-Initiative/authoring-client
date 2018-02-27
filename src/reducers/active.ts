import * as Immutable from 'immutable';
import * as actions from 'actions/active';
import { ActiveContext } from 'types/active';
import { EditedDocument } from 'types/document';
import createGuid from 'utils/guid';

export type ActionTypes =
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
      return state.with({ activeChild: action.content, documentId: action.documentId });
    case actions.UPDATE_CONTEXT:
      return state.with({
        activeChild: action.content,
        container: action.container,
        documentId: action.documentId,
      });
    default:
      return state;
  }
};
