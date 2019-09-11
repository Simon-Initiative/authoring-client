import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { Essay } from 'data/content/assessment/essay';
import { responsesMatchAnswerChoices, testScores, scores, hasScore } from './_questions-test';
import { Maybe } from 'tsmonad';
const jsonEssay = require('./questions-valid/essay.json');
const jsonEssayNoScore = require('./questions-valid/essay-no-score.json');

// tslint:disable max-line-length
describe('essay should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonEssay, guid()).toPersistence(),
    guid());

  const items = question.items;
  const item = items.first() as Essay;

  const parts = question.parts;
  const part = parts.first();

  const responses = part.responses;
  const explanation = question.explanation;

  it('has one item', () => {
    expect(items.size).toEqual(1);
    expect(item.contentType).toBe('Essay');
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has an explanation', () => {
    expect(explanation).toBeTruthy();
  });

  it('has one response', () => {
    expect(responses.size).toEqual(1);
  });

  // tslint:disable-next-line: max-line-length
  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = [];
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
  });

  const responsesNoScore = (Question.fromPersistence(jsonEssayNoScore, guid()) as Question).parts.first().responses;

  it('no longer stores scores as strings, but as maybes instead', () => {
    expect(scores(responses).every(score => score instanceof Maybe));
    expect(scores(responsesNoScore).every(score => score instanceof Maybe));
  });

  it('persists non-empty scores', () => {
    expect(scores(responses).some(hasScore));
  });

  it('does not persist empty scores', () => {
    expect(scores(responsesNoScore).some(score => !hasScore(score)));
  });
});
