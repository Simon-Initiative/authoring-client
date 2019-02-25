
import {
  ORG_REQUESTED, ORG_LOADED, ORG_CHANGE_FAILED, MODEL_UPDATED, ORG_CHANGE_SUCCEEDED,
  OrgChangeSucceededAction,
  OrgChangeFailedAction, OrgLoadedAction, OrgRequestedAction, ModelUpdatedAction,
} from 'actions/orgs';
import { OtherAction } from './utils';
import { Document } from 'data/persistence';
import { Maybe } from 'tsmonad';

type ActionTypes =
  OrgChangeFailedAction | OrgChangeSucceededAction |
  OrgLoadedAction | OrgRequestedAction | ModelUpdatedAction | OtherAction;

export type OrgsState = {
  activeOrg: Maybe<Document>,
  lastChangeSucceeded: boolean,
};

const initialState = {
  activeOrg: Maybe.nothing<Document>(),
  lastChangeSucceeded: true,
};

export const orgs = (
  state: OrgsState = initialState,
  action: ActionTypes,
): OrgsState => {
  switch (action.type) {
    case MODEL_UPDATED:
      const activeOrg = state.activeOrg.caseOf({
        just: d => Maybe.just(d.with({ model: action.model })),
        nothing: () => Maybe.nothing(),
      });
      return Object.assign({}, state, { activeOrg });
    case ORG_REQUESTED:
      return state;
    case ORG_LOADED:
      return Object.assign({}, state, { activeOrg: Maybe.just(action.document) });
    case ORG_CHANGE_FAILED:
      return Object.assign({}, state, { lastChangeSucceeded: false });
    case ORG_CHANGE_SUCCEEDED:
      return Object.assign({}, state, { lastChangeSucceeded: true });
    default:
      return state;
  }
};
