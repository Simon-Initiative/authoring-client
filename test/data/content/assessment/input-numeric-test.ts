import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { responsesMatchAnswerChoices, testScores } from './_questions-test';
const jsonInputNumeric = require('./questions-valid/input-numeric.json');
const jsonMatchStarValid = require('./questions-valid/input-numeric-match-star.json');
const jsonMatchStarInvalid = require('./questions-invalid/input-numeric-match-star.json');

// tslint:disable max-line-length
describe('input - numeric should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonInputNumeric, guid()).toPersistence(),
    guid());

  const items = question.items;

  const parts = question.parts;
  const part1 = parts.first();

  const responses = part1.responses;
  const explanation = question.explanation;

  it('has two items', () => {
    expect(items.size).toEqual(2);
    items.forEach(item => expect(item.contentType).toBe('Numeric'));
  });

  it('has two parts', () => {
    expect(parts.size).toEqual(2);
  });

  it('has an explanation', () => {
    expect(explanation).toBeTruthy();
  });

  it('has responses', () => {
    expect(responses.size).toBeTruthy();
  });

  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = [];
    question.parts.forEach((part) => {
      const matches = part.responses.toArray().map(response => response.match);
      expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
    });
  });

  testScores(responses);
});


describe('input - numeric have `match: "*" responses only at the end`', () => {
  // This question has a response with match "*" in the wrong position, and needs a change
  const invalidQuestionStarMatch: Question = Question.fromPersistence(
    Question.fromPersistence(jsonMatchStarInvalid, guid()).toPersistence(),
    guid());

  // This question has the match "*" in the correct position, and needs no change
  const validQuestionStarMatch: Question = Question.fromPersistence(
    Question.fromPersistence(jsonMatchStarValid, guid()).toPersistence(),
    guid());

  it('makes no changes to the responses when a `match: "*"` is at the end', () => {
    expect(validQuestionStarMatch.toPersistence()).toEqual(jsonMatchStarValid);
  });

  it('makes a change to the responses when a `match: "*" is not at the end', () => {
    expect(invalidQuestionStarMatch.toPersistence()).not.toEqual(jsonMatchStarInvalid);
  });

  it('does not allow responses to have a `match: "*"` except for at the end', () => {
    expect(invalidQuestionStarMatch.parts.every(part =>
      part.responses.butLast().every(response => response.match !== '*'))).not.toBe(false);
  });

  it('ensures the `match: "*"` stays at the end for valid questions', () => {
    expect(invalidQuestionStarMatch.parts.some(part => part.responses.last().match === '*')).toBe(true);
  });
});
