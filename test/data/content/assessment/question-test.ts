
import { filterOutExtraParts, Question } from 'data/content/assessment/question';
import { Part } from 'data/content/assessment/part';
import guid from 'utils/guid';
import { MultipleChoice } from 'data/content/assessment/multiple_choice';
import { ShortAnswer } from 'data/contentTypes';
import { Ordering } from 'data/content/assessment/ordering';
import { FillInTheBlank } from 'data/content/assessment/fill_in_the_blank';
const jsonMultipleChoice = require('!./questions-valid/multiple-choice.json');
const jsonMultipleChoiceInvalid = require('!./questions-invalid/multiple-choice.json');
const jsonCheckAllThatApply = require('!./questions-valid/cata.json');
const jsonShortAnswer = require('!./questions-valid/short-answer.json');
const jsonOrdering = require('!./questions-valid/ordering.json');
const jsonInputDropdown = require('!./questions-valid/input-dropdown.json');
const jsonInputText = require('!./questions-valid/input-text.json');
const jsonInputNumeric = require('!./questions-valid/input-numeric.json');

it('Filters out extra parts', () => {
  const updated = filterOutExtraParts([new Part(), new Part(), new Part()], 1);
  expect(updated.length).toBe(1);
});

function responsesMatchAnswerChoices(values: string[], matches: string[]) {
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

describe('multiple choice questions should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonMultipleChoice, guid());

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

  it('has choices', () => {
    expect(choices.size).toEqual(2);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has responses', () => {
    expect(responses.size).toEqual(2);
  });

  // tslint:disable-next-line: max-line-length
  it('has responses that all match up with its answer choices when the question json is valid', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeTruthy();
  });

  // tslint:disable-next-line: max-line-length
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
});

describe('check all that apply should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonCheckAllThatApply, guid());

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

  it('is check all that apply and not multiple choice', () => {
    expect(item.select).toEqual('multiple');
  });

  it('has choices', () => {
    expect(choices.size).toEqual(2);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has responses', () => {
    expect(responses.size).toEqual(2);
  });

  // tslint:disable-next-line: max-line-length
  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
  });
});

describe('ordering should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonOrdering, guid());

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

  it('has two choices', () => {
    expect(choices.size).toEqual(2);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has two responses', () => {
    expect(responses.size).toEqual(2);
  });

  // tslint:disable-next-line: max-line-length
  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
  });
});

describe('short answer should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonShortAnswer, guid());

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

  // tslint:disable-next-line: max-line-length
  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = [];
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
  });
});

it('input - numeric should be parsed correctly', () => {

});

it('input - text should be parsed correctly', () => {

});

it('input - dropdown should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonInputDropdown, guid());

  const items = question.items;
  const item = items.first() as FillInTheBlank;

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

  // tslint:disable-next-line: max-line-length
  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = [];
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
  });
});

it('essay should be parsed correctly', () => {

});

it('drag and drop', () => {

});


it('image hotspot', () => {

});
