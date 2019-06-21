import { parseDate, compareDates, relativeToNow } from 'utils/date';

it('parseDate test', () => {
  expect(parseDate('May 5, 2019 3:24:00 AM')).toBe(new Date('2019-5-17T03:24:00'));
});

it('compareDates test', () => {
  expect(compareDates(new Date(), new Date())).toBe(0);


});

// testing for all 13 possible outputs
// note: tests depend on the current time for now!  need tp be updated for stablility
it('relativeToNow test', () => {
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date())).toBe('just now');
  expect(relativeToNow(new Date('2019-5-17T03:24:00'))).toBe('a month ago');
  expect(relativeToNow(new Date('2018-5-17T03:24:00'))).toBe('a year ago');
  expect(relativeToNow(new Date('December 17, 1995 03:24:00'))).toBe('13 years ago');


});
