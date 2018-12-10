import { convert } from './format';

// Generate all permutations of the labels array.
export const generatePermutations = (numChoices: number) => {
  const labels = [];
  for (let i = 0; i < numChoices; i = i + 1) {
    labels.push(convert.toAlphaNotation(i));
  }

  return perm(labels);
};


const perm = (labels) => {
  const ret = [];

  for (let i = 0; i < labels.length; i = i + 1) {

    const rest = perm(labels.slice(0, i).concat(labels.slice(i + 1)));

    if (!rest.length) {
      ret.push([labels[i]]);
    } else {
      for (let j = 0; j < rest.length; j = j + 1) {
        ret.push([labels[i]].concat(rest[j]));
      }
    }
  }
  return ret;
};
