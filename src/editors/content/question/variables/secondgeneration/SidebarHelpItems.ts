// tslint:disable:max-line-length
const baseUrl = 'http://localhost:3000';
const directory = 'docs';
const createUrl = (anchor: string) =>
  [baseUrl, directory, anchor].join('/');

export default [
  {
    name: 'almostEqual',
    description: 'Returns true if two numbers are "almost equal" within a given difference',
    link: createUrl('oliapi.html#olialmostequala-number-b-number-difference-number-10-7'),
    content: 'const pi = Math.PI\nconst piApproximation = 3.14159\nconst isApproimatelyPi = OLI.almostEqual(pi, piApproximation, 10 ** -4)',
  },
  {
    name: 'gcd',
    description: 'Returns the greatest common divisor of two dividends',
    link: createUrl('oliapi.html#oligcdx-number-y-number'),
    content: 'const divisor = OLI.gcd(6, 60)',
  },
  {
    name: 'random',
    description: 'Returns a randomly generated number within a range, with the specified decimal positions',
    link: createUrl('oliapi.html#olirandomlower-number-upper-number-decimalpositions-number-0'),
    content: 'const myRandomNum = OLI.random(0, 10, 2)',
  },
  {
    name: 'randomArrayItem',
    description: 'Returns a randomly selected value from an array',
    link: createUrl('oliapi.html#olirandomarrayitemarr-any'),
    // tslint:disable-next-line:quotemark
    content: "const items = ['apple', 'orange', 'tomato']\nconst randomItem = OLI.randomArrayItem(items);",
  },
  {
    name: 'randomInt',
    description: 'Returns a randomly generated integer with a range',
    link: createUrl('oliapi.html#olirandomintlower-number-upper-number'),
    content: 'const randomInteger = OLI.randomInt(0, 10)',
  },
  {
    name: 'round',
    description: 'Returns the rounded value of a number',
    link: createUrl('oliapi.html#oliroundnum-number-decimalpositions-number-1'),
    content: 'const preciseNumber = 1.12234\nconst rounded = OLI.round(preciseNumber, 2)',
  },
  {
    name: 'toRadians',
    description: 'Returns the value of a number in radians',
    link: createUrl('oliapi.html#olitoradiansd-number'),
    content: 'const degrees = 180\nconst radians = OLI.toRadians(degrees)',
  },
];
