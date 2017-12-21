import { convert } from './format';

/**
 * Generates all combinations for a given number of choices
 */
export const generateCombinations = (numChoices) => {
  // function that recursively generates all combinations of the specified ids
  const recursiveCombination = (ids, prefix = []) => {
    // combine nested arrays into a single result array
    return ids.reduce(
      (acc, id, i) => {
        // return an array containing the current new combination
        // and recursively add remaining combinations
        return acc.concat([
          [...prefix, id],
          ...recursiveCombination(ids.slice(i + 1), [...prefix, id]),
        ]);
      },
      [],
    );
  };

  const choices = [];
  for (let i = 0; i < numChoices; i = i + 1) {
    choices.push(convert.toAlphaNotation(i));
  }

  // generate all combinations
  return recursiveCombination(choices);
};
