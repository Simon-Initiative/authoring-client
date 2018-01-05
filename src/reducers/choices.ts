import { OrderedMap } from 'immutable';
import { CombinationsMap } from 'types/combinations';
import { RECEIVE_COMBINATIONS, ReceiveCombinations } from 'actions/choices';
import { OtherAction } from './utils';

type ActionTypes = ReceiveCombinations | OtherAction;

export type ChoicesState = OrderedMap<number, CombinationsMap>;

const initialState = OrderedMap<number, CombinationsMap>();

export const choices = (
  state: ChoicesState = initialState,
  action: ActionTypes,
): ChoicesState => {
  switch (action.type) {
    case RECEIVE_COMBINATIONS:
      return state.set(action.comboNum, action.combinations);
    default:
      return state;
  }
};
