import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { testScores } from './_questions-test';
const jsonDnd = require('./questions-valid/dnd.json');

// tslint:disable max-line-length
describe('drag and drop should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonDnd, guid()).toPersistence(),
    guid());

  const items = question.items;

  const parts = question.parts;
  const part1 = parts.first();

  const responses = part1.responses;
  const explanation = question.explanation;

  it('has two items', () => {
    expect(items.size).toEqual(2);
    items.forEach(item => expect(item.contentType).toBe('FillInTheBlank'));
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

  testScores(responses);
});
