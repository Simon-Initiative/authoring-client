
import {
  ORG_REQUESTED, ORG_LOADED, ORG_FAILED, OrgFailedAction,
  OrgLoadedAction, OrgRequestedAction,
} from 'actions/orgs';
import { OtherAction } from './utils';
import { Document } from 'data/persistence';
import { Maybe } from 'tsmonad';

type ActionTypes = OrgFailedAction | OrgLoadedAction | OrgRequestedAction | OtherAction;

export type OrgsState = {
  activeOrg: Maybe<Document>,
};

const initialState = {
  activeOrg: Maybe.nothing<Document>(),
};

export const orgs = (
  state: OrgsState = initialState,
  action: ActionTypes,
): OrgsState => {
  switch (action.type) {
    case ORG_REQUESTED:
      return state;
    case ORG_LOADED:
      return Object.assign({}, state, { activeOrg: Maybe.just(action.document) });
    case ORG_FAILED:
      return state;
    default:
      return state;
  }
};
