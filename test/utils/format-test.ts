import { convert } from 'utils/format';

it('toAlphaNotation test', () => {

  const { toAlphaNotation } = convert;

  expect(toAlphaNotation(0)).toBe('A');
  expect(toAlphaNotation(25)).toBe('Z');
  expect(toAlphaNotation(26)).toBe('AA');
  expect(toAlphaNotation(27)).toBe('AB');
  expect(toAlphaNotation(51)).toBe('AZ');
  expect(toAlphaNotation(52)).toBe('BA');
  expect(toAlphaNotation(77)).toBe('BZ');
  expect(toAlphaNotation(78)).toBe('CA');
  expect(toAlphaNotation(676)).toBe('AAA');
  expect(toAlphaNotation(677)).toBe('AAB');

});
