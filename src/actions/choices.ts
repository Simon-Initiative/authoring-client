import { List, OrderedMap } from 'immutable';
import { CombinationsMap } from 'types/combinations';
import { ChoicesState } from 'reducers/choices';
import { generateCombinations } from 'utils/combinations';

export const RECEIVE_COMBINATIONS = 'choices/RECEIVE_COMBINATIONS';
export type RECEIVE_COMBINATIONS = typeof RECEIVE_COMBINATIONS;

export type ReceiveCombinations = {
  type: RECEIVE_COMBINATIONS,
  comboNum: number,
  combinations: CombinationsMap,
};

export const receiveCombinations = (
  comboNum: number,
  combinations: CombinationsMap,
): ReceiveCombinations => ({
  type: RECEIVE_COMBINATIONS,
  comboNum,
  combinations,
});

export const computeCombinations = (comboNum: number) => (
  (dispatch: any, getState): CombinationsMap => {
    const choices = getState().choices;

    if (!getState().choices.has(comboNum)) {
      const combinationsMap: CombinationsMap = generateCombinations(comboNum)
        .reduce(
          (acc, c) => acc.set(
            c.join(','),
            List(c),
          ),
          OrderedMap<string, List<string>>(),
        );

      dispatch(receiveCombinations(comboNum, combinationsMap));

      return combinationsMap;
    }

    return choices.get(comboNum);
  }
);
