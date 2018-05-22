import { OrderedMap } from 'immutable';
import { CombinationsMap, PermutationsMap } from 'types/combinations';
import { RECEIVE_COMBINATIONS, RECEIVE_PERMUTATIONS,
  ReceiveCombinations, ReceivePermutations } from 'actions/choices';
import { OtherAction } from './utils';

type ActionTypes = ReceiveCombinations | ReceivePermutations | OtherAction;

export type ChoicesState = {
  combinations: OrderedMap<number, CombinationsMap>,
  permutations: OrderedMap<number, PermutationsMap>,
};

const initialState = {
  combinations: OrderedMap<number, CombinationsMap>(),
  permutations: OrderedMap<number, PermutationsMap>(),
};

export const choices = (
  state: ChoicesState = initialState,
  action: ActionTypes,
): ChoicesState => {
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
