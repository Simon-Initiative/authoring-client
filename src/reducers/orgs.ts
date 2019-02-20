
import {
  RECEIVE_COMBINATIONS, RECEIVE_PERMUTATIONS,
  ReceiveCombinations, ReceivePermutations
} from 'actions/orgs';
import { OtherAction } from './utils';
import * as models from 'data/models';
import { Maybe } from 'tsmonad';

type ActionTypes = ReceiveCombinations | ReceivePermutations | OtherAction;

export type OrgsState = Maybe<models.OrganizationModel>;

const initialState = {
  activeOrg: Maybe.nothing(),
};

export const orgs = (
  state: OrgsState = initialState,
  action: ActionTypes,
): OrgsState => {
  switch (action.type) {
    case RECEIVE_COMBINATIONS:
      return Object.assign(
        {},
        state,
        { combinations: state.combinations.set(action.comboNum, action.combinations) });
    case RECEIVE_PERMUTATIONS:
      return Object.assign(
        {},
        state,
        { permutations: state.permutations.set(action.comboNum, action.permutations) });
    default:
      return state;
  }
};
