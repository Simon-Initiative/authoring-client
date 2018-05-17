import { List, OrderedMap } from 'immutable';
import { CombinationsMap, PermutationsMap } from 'types/combinations';
import { generateCombinations } from 'utils/combinations';
import { generatePermutations } from 'utils/permutations';

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


export const RECEIVE_PERMUTATIONS = 'choices/RECEIVE_PERMUTATIONS';
export type RECEIVE_PERMUTATIONS = typeof RECEIVE_PERMUTATIONS;

export type ReceivePermutations = {
  type: RECEIVE_PERMUTATIONS,
  comboNum: number,
  permutations: PermutationsMap,
};

export const receivePermutations = (
  comboNum: number,
  permutations: PermutationsMap,
): ReceivePermutations => ({
  type: RECEIVE_PERMUTATIONS,
  comboNum,
  permutations,
});


export const computeCombinations = (comboNum: number) => (
  (dispatch: any, getState): CombinationsMap => {
    const choices = getState().choices.combinations;

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


export const computePermutations = (comboNum: number) => (
  (dispatch: any, getState): PermutationsMap => {
    const choices = getState().choices.permutations;

    if (!getState().choices.has(comboNum)) {
      const permutationsMap: PermutationsMap = generatePermutations(comboNum)
        .reduce(
          (acc, c) => acc.set(
            c.join(','),
            List(c),
          ),
          OrderedMap<string, List<string>>(),
        );

      dispatch(receivePermutations(comboNum, permutationsMap));

      return permutationsMap;
    }

    return choices.get(comboNum);
  }
);
