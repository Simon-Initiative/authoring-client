
import { filterOutExtraParts, Question } from 'data/content/assessment/question';
import { Part } from 'data/content/assessment/part';
import guid from 'utils/guid';
import { MultipleChoice } from 'data/content/assessment/multiple_choice';
import { ShortAnswer } from 'data/contentTypes';
const jsonMultipleChoice = require('!./questions-valid/multiple-choice.json');
const jsonCheckAllThatApply = require('!./questions-valid/cata.json');
const jsonShortAnswer = require('!./questions-valid/short-answer.json');

it('Filters out extra parts', () => {
  const updated = filterOutExtraParts([new Part(), new Part(), new Part()], 1);
  expect(updated.length).toBe(1);
});

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

  it('has responses that match up with its answer choices', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(values.length).toEqual(matches.length);

    values.forEach((value) => {
      expect(matches).toContain(value);
    });
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

  it('has responses that match up with its answer choices', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(values.length).toEqual(matches.length);

    values.forEach((value) => {
      expect(matches).toContain(value);
    });
  });
});

it('ordering', () => {
  const question: Question = Question.fromPersistence(jsonCheckAllThatApply, guid());

  const items = question.items;
  const item = items.first() as MultipleChoice;

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

  it('has responses that match up with its answer choices', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(values.length).toEqual(matches.length);

    values.forEach((value) => {
      expect(matches).toContain(value);
    });
  });
});

it('short answer', () => {
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

  it('has a response that matches all answers', () => {
    expect(responses.first().match).toEqual('*');
  });
});

it('input - numeric', () => {

});

it('input - text', () => {

});

it('input - dropdown', () => {

});

it('drag and drop', () => {

});

it('essay', () => {

});

it('image hotspot', () => {

});