import { generatePermutations } from 'utils/permutations';

// helper function to turn all permutations in a comma
// delimeted string to ease verification code.
// The returned string will look like:
// ",ABC,ACB,BAC,BCA,CAB,CBA,"
function toString(perms: string[][]) : string {
  return perms.reduce(
    (acc, current) => {
      return acc + current.reduce(
        (a, c) => a + c,
        '',
      ) + ',';
    },
    ',',
  );
}

it('should return all the permutations', () => {

  let results = generatePermutations(0);
  expect(results.length).toBe(0);

  results = generatePermutations(1);
  expect(results.length).toBe(1);

  results = generatePermutations(2);
  expect(results.length).toBe(2);
  let str = toString(results);
  expect(str.indexOf(',AB,') === -1).toBe(false);
  expect(str.indexOf(',BA,') === -1).toBe(false);

  results = generatePermutations(3);
  expect(results.length).toBe(6);
  str = toString(results);
  expect(str.indexOf(',ABC,') === -1).toBe(false);
  expect(str.indexOf(',ACB,') === -1).toBe(false);
  expect(str.indexOf(',BAC,') === -1).toBe(false);
  expect(str.indexOf(',BCA,') === -1).toBe(false);
  expect(str.indexOf(',CAB,') === -1).toBe(false);
  expect(str.indexOf(',CBA,') === -1).toBe(false);

  results = generatePermutations(4);
  expect(results.length).toBe(24);
});
