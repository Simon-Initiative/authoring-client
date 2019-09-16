import { filterOutExtraParts } from 'data/content/assessment/question';
import { Part } from 'data/content/assessment/part';
import { Response } from 'data/content/assessment/response';
import { Maybe } from 'tsmonad';

it('Filters out extra parts', () => {
  const updated = filterOutExtraParts([new Part(), new Part(), new Part()], 1);
  expect(updated.length).toBe(1);
});

export function responsesMatchAnswerChoices(values: string[], matches: string[]) {
  let matching = true;

  if (values.length !== matches.length) {
    matching = false;
  }

  values.forEach((value) => {
    if (!matches.includes(value)) {
      matching = false;
    }
  });

  matches.forEach((match) => {
    if (!values.includes(match)) {
      matching = false;
    }
  });

  return matching;
}

export const scores = (responses: typeof Part.prototype.responses) =>
  responses.map(response => response.score).toArray();
export const hasScore = (score: typeof Response.prototype.score) =>
  score.caseOf({ just: _ => true, nothing: () => false });

export function testScores(responses: typeof Part.prototype.responses) {
  it('no longer stores scores as strings, but as maybes instead', () => {
    expect(scores(responses).every(score => score instanceof Maybe));
  });

  it('persists non-empty scores', () => {
    expect(scores(responses).some(hasScore));
  });

  it('does not persist empty scores', () => {
    expect(scores(responses).some(score => !hasScore(score)));
  });
}
