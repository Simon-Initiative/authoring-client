import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { FillInTheBlank } from 'data/content/assessment/fill_in_the_blank';
import { responsesMatchAnswerChoices, testScores } from './_questions-test';
const jsonInputDropdown = require('./questions-valid/input-dropdown.json');

// tslint:disable max-line-length
describe('input - dropdown should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonInputDropdown, guid()).toPersistence(),
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

  // tslint:disable-next-line: max-line-length
  it('has responses that all match up with its answer choices when the question json is valid', () => {
    const parts = question.parts.toArray();
    items.toArray().forEach((item: FillInTheBlank, i) => {
      const values = item.choices.toArray().map(choice => choice.value);
      const matches = parts[i].responses.toArray().map(response => response.match);
      expect(responsesMatchAnswerChoices(values, matches)).toBeTruthy();
    });
  });

  testScores(responses);
});
