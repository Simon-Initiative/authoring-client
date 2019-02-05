
import { filterOutExtraParts } from 'data/content/assessment/question';
import { Part } from 'data/content/assessment/part';

it('Filters out extra parts', () => {
  const updated = filterOutExtraParts([new Part(), new Part(), new Part()], 1);
  expect(updated.length).toBe(1);
});
