import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { Ordering } from 'data/content/assessment/ordering';
import { responsesMatchAnswerChoices, testScores } from './_questions-test';
const jsonOrdering = require('./questions-valid/ordering.json');

// tslint:disable max-line-length
describe('ordering should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonOrdering, guid()).toPersistence(),
    guid());

  const items = question.items;
  const item = items.first() as Ordering;

  const choices = item.choices;

  const parts = question.parts;
  const part = parts.first();

  const responses = part.responses;

  it('has one item', () => {
    expect(items.size).toEqual(1);
    expect(item.contentType).toBe('Ordering');
  });

  it('has choices', () => {
    expect(choices.size).toEqual(4);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has autogenerated responses', () => {
    expect(responses.size).toEqual(24);
  });

  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
  });

  testScores(responses);
});
