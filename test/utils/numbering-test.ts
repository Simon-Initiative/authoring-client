import * as numbering from 'utils/numbering';

it('leading zero test', () => {

  expect(numbering.asDecimalLeadingZero(0, 100)).toBe('0000');
  expect(numbering.asDecimalLeadingZero(1, 9999)).toBe('00001');
  expect(numbering.asDecimalLeadingZero(1, 9)).toBe('01');
  expect(numbering.asDecimalLeadingZero(1, 99)).toBe('001');
  expect(numbering.asDecimalLeadingZero(1, 100)).toBe('0001');
  expect(numbering.asDecimalLeadingZero(1, 101)).toBe('0001');

});


it('upper roman numerals test', () => {

  expect(numbering.asUpperRoman(1)).toBe('I');
  expect(numbering.asUpperRoman(4)).toBe('IV');
  expect(numbering.asUpperRoman(5)).toBe('V');
  expect(numbering.asUpperRoman(6)).toBe('VI');
  expect(numbering.asUpperRoman(11)).toBe('XI');

});


it('lower roman numerals test', () => {

  expect(numbering.asLowerRoman(1)).toBe('i');

});


it('lower alpha test', () => {

  expect(numbering.asLowerAlpha(1)).toBe('a');
  expect(numbering.asLowerAlpha(2)).toBe('b');
  expect(numbering.asLowerAlpha(27)).toBe('a');

});

it('upper alpha test', () => {

  expect(numbering.asUpperAlpha(1)).toBe('A');
  expect(numbering.asUpperAlpha(2)).toBe('B');
  expect(numbering.asUpperAlpha(27)).toBe('A');

});
