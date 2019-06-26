import { parseDate, compareDates, relativeTo } from 'utils/date';

// must include Z in date constructor to avoid timezone weirdness
it('parseDate test', () => {
  console.log(parseDate('May 5, 2019 3:24:00 AM'));
  console.log(new Date('May 5, 2019 3:24:00 AM'));
  expect(parseDate('May 5, 2019 3:24:00 AM')).toStrictEqual(new Date('2019-05-05T03:24:00Z'));
  expect(parseDate('May 5, 2019 3:24:00 AM')).toStrictEqual(new Date('May 5, 2019 3:24:00 AM'));
});

it('compareDates test', () => {
  expect(compareDates(new Date(), new Date())).toBe(0);


});

// testing for all 13 possible outputs
// takes dates in chronological order as arguments, here expressed in ms
// numbers calculated using constants from relativeTo function
// tests should be exactly on the margin between different timestamps
it('relativeTo test', () => {
  expect(relativeTo(new Date(),
                    new Date())).toBe('just now');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000001999))).toBe('just now');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000002000))).toBe('a few seconds ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000006999))).toBe('a few seconds ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000007000))).toBe('7 seconds ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000059999))).toBe('59 seconds ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000060000))).toBe('a minute ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000119999))).toBe('a minute ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500000120000))).toBe('2 minutes ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500003599999))).toBe('59 minutes ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500003600000))).toBe('an hour ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500007199999))).toBe('an hour ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500007200000))).toBe('2 hours ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500086399999))).toBe('23 hours ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500086400000))).toBe('a day ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500172799999))).toBe('a day ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500172800000))).toBe('2 days ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500518399999))).toBe('5 days ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(500518400000))).toBe('a week ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(501209599999))).toBe('a week ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(501209600000))).toBe('2 weeks ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(502635199999))).toBe('4 weeks ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(502635200000))).toBe('a month ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(505270399999))).toBe('a month ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(505270400000))).toBe('2 months ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(528900799999))).toBe('10 months ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(528900800000))).toBe('a year ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(563071999999))).toBe('a year ago');
  expect(relativeTo(new Date(500000000000),
                    new Date(563072000000))).toBe('2 years ago');
  expect(relativeTo(new Date(500000000000),
                    new Date('June 21, 2019 2:24:00 PM'))).toBe('33 years ago');

});
