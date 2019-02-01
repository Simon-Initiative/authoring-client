import * as Immutable from 'immutable';

import { filterOutExtraParts, Question } from 'data/content/assessment/question';
import { Part } from 'data/content/assessment/part';
import { MultipleChoice } from 'data/content/assessment/multiple_choice';
import { Choice } from 'data/content/assessment/choice';
import { Response } from 'data/content/assessment/response';
import guid from 'utils/guid';
import { map, filter } from 'data/utils/map';

it('Filters out extra parts', () => {
  const updated = filterOutExtraParts([new Part(), new Part(), new Part()], 1);
  expect(updated.length).toBe(1);
});

it('tests mutation of responses', () => {

  const c1 = Choice.fromText('A', guid());
  const c2 = Choice.fromText('B', guid());
  const c3 = Choice.fromText('C', guid());

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

  const visited = filter(e => e !== p, q);
  let count = 0;
  map(
    (e) => {
      if (e.contentType === 'Part') {
        count += 1;
      }
      return e;
    },
    visited);

  expect(count).toBe(0);
});
