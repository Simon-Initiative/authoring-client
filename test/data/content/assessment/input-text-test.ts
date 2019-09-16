import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { responsesMatchAnswerChoices, testScores } from './_questions-test';
const jsonInputText = require('./questions-valid/input-text.json');

// tslint:disable max-line-length
describe('input - text should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonInputText, guid()).toPersistence(),
    guid());

  const items = question.items;

  const parts = question.parts;
  const part1 = parts.first();

  const responses = part1.responses;
  const explanation = question.explanation;

  it('has two items', () => {
    expect(items.size).toEqual(2);
    items.forEach(item => expect(item.contentType).toBe('Text'));
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
