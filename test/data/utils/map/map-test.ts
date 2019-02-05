import * as Immutable from 'immutable';

import { Question } from 'data/content/assessment/question';
import { Part } from 'data/content/assessment/part';
import { MultipleChoice } from 'data/content/assessment/multiple_choice';
import { Choice } from 'data/content/assessment/choice';
import { Response } from 'data/content/assessment/response';
import guid from 'utils/guid';
import { map, filter, reduce } from 'data/utils/map';

// Immutable test setup:
const c1 = Choice.fromText('A', guid()).with({ value: 'A' });
const c2 = Choice.fromText('B', guid()).with({ value: 'B' });
const c3 = Choice.fromText('C', guid()).with({ value: 'C' });

const mc = new MultipleChoice().with({
  choices: Immutable.OrderedMap([[c1.guid, c1], [c2.guid, c2], [c3.guid, c3]]),
});

const r1 = new Response().with({ match: '1' });
const r2 = new Response().with({ match: '2' });

const p = new Part().with({
  responses: Immutable.OrderedMap([[r1.guid, r1], [r2.guid, r2]]),
});

const q = new Question().with({
  items: Immutable.OrderedMap([[mc.guid, mc]]),
  parts: Immutable.OrderedMap([[p.guid, p]]),
});



it('tests mapping', () => {

  // Performs the identity map
  const identity = map(e => e, q);

  // Appends 'updated' to the values of choices
  const updated = map(
    e => e.contentType === 'Choice'
      ? e.with({ value: e.value + 'updated' }) : e,
    q);

  // Verify we have three choices, none updated in the identity
  let count = 0;
  map(
    (e) => {
      if (e.contentType === 'Choice' && (e as Choice).value.indexOf('updated') === -1) {
        count += 1;
      }
      return e;
    },
    identity);

  expect(count).toBe(3);

  // Verify we have three choices, all updated
  count = 0;
  map(
    (e) => {
      if (e.contentType === 'Choice' && (e as Choice).value.indexOf('updated') !== -1) {
        count += 1;
      }
      return e;
    },
    updated);

  expect(count).toBe(3);
});


it('tests filtering', () => {

  // Make sure we can filter out an item using
  // a pure object reference:
  const visited = filter(e => e !== c1, q);

  let count = 0;
  map(
    (e) => {
      if (e.contentType === 'Choice') {
        count += 1;
      }
      return e;
    },
    visited);

  expect(count).toBe(2);
});

it('tests reduce', () => {

  const visited = reduce(
    (p, c) => {
      p[c.guid] = c;
      return p;
    },
    {},
    mc);

  // The correct result should be 7, one for the mc,
  // one each for the chocies, and a contiguous text
  // for each choice content
  expect(Object.keys(visited).length).toBe(7);
});
