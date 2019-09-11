import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { ShortAnswer } from 'data/contentTypes';
import { responsesMatchAnswerChoices, scores, hasScore } from './_questions-test';
import { Maybe } from 'tsmonad';
const jsonShortAnswer = require('./questions-valid/short-answer.json');
const jsonShortAnswerNoScore = require('./questions-valid/short-answer-no-score.json');

// tslint:disable max-line-length
describe('short answer should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonShortAnswer, guid()).toPersistence(),
    guid());

  const items = question.items;
  const item = items.first() as ShortAnswer;

  const parts = question.parts;
  const part = parts.first();

  const responses = part.responses;
  const explanation = question.explanation;

  it('has one item', () => {
    expect(items.size).toEqual(1);
    expect(item.contentType).toBe('ShortAnswer');
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

  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = [];
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
  });

  const responsesNoScore = (Question.fromPersistence(jsonShortAnswerNoScore, guid()) as Question).parts.first().responses;

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
