import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { MultipleChoice } from 'data/content/assessment/multiple_choice';
import { responsesMatchAnswerChoices, testScores } from './_questions-test';
const jsonMultipleChoice = require('./questions-valid/multiple-choice.json');
const jsonMultipleChoiceInvalid = require('./questions-invalid/multiple-choice.json');
const jsonAsterisk = require('./questions-valid/with-asterisk.json');

// tslint:disable max-line-length
describe('multiple choice questions should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonMultipleChoice, guid()).toPersistence(),
    guid());

  const items = question.items;
  const item = items.first() as MultipleChoice;

  const choices = item.choices;

  const parts = question.parts;
  const part = parts.first();

  const responses = part.responses;

  it('has one item', () => {
    expect(items.size).toEqual(1);
    expect(item.contentType).toBe('MultipleChoice');
  });

  it('is multiple choice and not check all that apply', () => {
    expect(item.select).toEqual('single');
  });

  it('has 4 choices', () => {
    expect(choices.size).toEqual(4);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has 4 responses', () => {
    expect(responses.size).toEqual(4);
  });

  it('has responses that all match up with its answer choices when the question json is valid', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeTruthy();
  });

  it('ignores the asterisk in the match', () => {
    const question: Question = Question.fromPersistence(jsonAsterisk, guid());

    const items = question.items;
    const item = items.first() as MultipleChoice;

    const choices = item.choices;

    const parts = question.parts;
    const part = parts.first();

    const responses = part.responses;

    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(choices.size).toEqual(4);
    expect(parts.size).toEqual(1);
    expect(responses.size).toEqual(2);
  });

  it('removes responses that dont match up to answer choices when the question json is invalid', () => {
    const question: Question = Question.fromPersistence(jsonMultipleChoiceInvalid, guid());

    const items = question.items;
    const item = items.first() as MultipleChoice;

    const choices = item.choices;

    const parts = question.parts;
    const part = parts.first();

    const responses = part.responses;

    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeTruthy();
  });

  testScores(responses);
});
