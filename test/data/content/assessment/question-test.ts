
import { filterOutExtraParts, Question } from 'data/content/assessment/question';
import { Part } from 'data/content/assessment/part';
import guid from 'utils/guid';
import { MultipleChoice } from 'data/content/assessment/multiple_choice';
import { ShortAnswer } from 'data/contentTypes';
import { Ordering } from 'data/content/assessment/ordering';
import { FillInTheBlank } from 'data/content/assessment/fill_in_the_blank';
import { Essay } from 'data/content/assessment/essay';
const jsonMultipleChoice = require('./questions-valid/multiple-choice.json');
const jsonMultipleChoiceInvalid = require('./questions-invalid/multiple-choice.json');
const jsonCheckAllThatApply = require('./questions-valid/cata.json');
const jsonShortAnswer = require('./questions-valid/short-answer.json');
const jsonOrdering = require('./questions-valid/ordering.json');
const jsonInputDropdown = require('./questions-valid/input-dropdown.json');
const jsonInputText = require('./questions-valid/input-text.json');
const jsonInputNumeric = require('./questions-valid/input-numeric.json');
const jsonDnd = require('./questions-valid/dnd.json');
const jsonImageHotspot = require('./questions-valid/image-hotspot.json');
const jsonEssay = require('./questions-valid/essay.json');
const jsonAsterisk = require('./questions-valid/with-asterisk.json');

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

  it('has 4 choices', () => {
    expect(choices.size).toEqual(4);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has 4 responses', () => {
    expect(responses.size).toEqual(4);
  });

  // tslint:disable-next-line: max-line-length
  it('has responses that all match up with its answer choices when the question json is valid', () => {
    const values = choices.toArray().map(choice => choice.value);
    const matches = responses.toArray().map(response => response.match);

    expect(responsesMatchAnswerChoices(values, matches)).toBeTruthy();
  });

  // tslint:disable-next-line: max-line-length
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

  it('has 4 choices', () => {
    expect(choices.size).toEqual(4);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has autogenerated responses', () => {
    expect(responses.size).toEqual(15);
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

  it('has choices', () => {
    expect(choices.size).toEqual(4);
  });

  it('has one part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has autogenerated responses', () => {
    expect(responses.size).toEqual(24);
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

describe('input - numeric should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonInputNumeric, guid());

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

  // tslint:disable-next-line: max-line-length
  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = [];
    question.parts.forEach((part) => {
      const matches = part.responses.toArray().map(response => response.match);
      expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
    });
  });
});

describe('input - text should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonInputText, guid());

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

  // tslint:disable-next-line: max-line-length
  it('does not remove responses that dont match up to answer choices, eg autogen responses, * matches, and targeted feedback', () => {
    const values = [];
    question.parts.forEach((part) => {
      const matches = part.responses.toArray().map(response => response.match);
      expect(responsesMatchAnswerChoices(values, matches)).toBeFalsy();
    });
  });
});

describe('input - dropdown should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonInputDropdown, guid());

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
});

describe('essay should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonEssay, guid());

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
});

describe('drag and drop should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonDnd, guid());

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
});


describe('image hotspot should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(jsonImageHotspot, guid());

  const items = question.items;

  const parts = question.parts;
  const part1 = parts.first();

  const responses = part1.responses;
  const explanation = question.explanation;

  it('has an item', () => {
    expect(items.size).toEqual(1);
    items.forEach(item => expect(item.contentType).toBe('ImageHotspot'));
  });

  it('has a part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has an explanation', () => {
    expect(explanation).toBeTruthy();
  });

  it('has responses', () => {
    expect(responses.size).toBeTruthy();
  });
});
