import * as Immutable from 'immutable';


import { ContentElements } from 'data/content/common/elements';
import { ALT_FLOW_ELEMENTS, QUESTION_BODY_ELEMENTS } from './types';
import { Part } from './part';
import { MultipleChoice } from './multiple_choice';
import { FillInTheBlank } from './fill_in_the_blank';
import { Ordering } from './ordering';
import { Text } from './text';
import { ShortAnswer } from './short_answer';
import { Essay } from './essay';
import { Numeric } from './numeric';
import { Feedback } from './feedback';
import { Response } from './response';
import { Unsupported } from '../unsupported';
import createGuid from '../../../utils/guid';
import { getKey } from '../../common';
import { augment, getChildren } from '../common';
import { ContiguousText } from 'data/content/learning/contiguous';
import { Changes } from 'data/content/learning/draft/changes';

export type Item = MultipleChoice | FillInTheBlank | Ordering | Essay
  | ShortAnswer | Numeric | Text | Unsupported;

export type QuestionParams = {
  id?: string;
  body?: ContentElements;
  concepts?: Immutable.List<string>;
  skills?: Immutable.Set<string>;
  grading?: string;
  items?: Immutable.OrderedMap<string, Item>;
  parts?: Immutable.OrderedMap<string, Part>;
  explanation?: ContentElements;
  guid?: string;
};

const defaultQuestionParams = {
  contentType: 'Question',
  elementType: 'question',
  id: '',
  body: new ContentElements(),
  concepts: Immutable.List<string>(),
  skills: Immutable.Set<string>(),
  grading: 'automatic',
  items: Immutable.OrderedMap<string, Item>(),
  parts: Immutable.OrderedMap<string, Part>(),
  explanation: new ContentElements(),
  guid: '',
};

const defaultItem = new ShortAnswer().toPersistence();
const defaultPart = new Part().toPersistence();

// Create a map of item ids to the items
export function buildItemMap(model: Question) {

  return model.items.toArray().reduce(
    (p, c) => {
      if ((c as any).id !== undefined) {
        p[(c as any).id] = c;
        return p;
      }

      return p;
    },
    {});

}

export function detectInputRefChanges(
  current: ContentElements, previous: ContentElements) : Changes {

  const initial : Changes = {
    additions: Immutable.List(),
    deletions: Immutable.List(),
  };

  return current.content.toArray()
    .filter(c => c.contentType === 'ContiguousText')
    .reduce(
      (delta, c) => {
        const p = previous.content.get(c.guid);
        if (p !== undefined) {
          const changes = (c as ContiguousText).detectInputRefChanges(p as ContiguousText);
          return {
            additions: delta.additions.concat(changes.additions).toList(),
            deletions: delta.deletions.concat(changes.deletions).toList(),
          };
        }
        return delta;
      },
      initial);
}

function ensureResponsesExist(model: Question) {
  const itemsArray = model.items.toArray();
  const partsArray = model.parts.toArray();
  let updated = model;

  for (let i = 0; i < itemsArray.length; i += 1) {
    const item = itemsArray[i];
    let part = partsArray[i];

    if (item.contentType === 'MultipleChoice') {
      if (item.select === 'single') {

        // Make sure that there are n responses for n choices
        const choiceCount = item.choices.size;
        const responseCount = part.responses.size;

        let difference = choiceCount - responseCount;
        while (difference > 0) {

          const f = new Feedback();
          const feedback = Immutable.OrderedMap<string, Feedback>();
          const response = new Response().with({ feedback: feedback.set(f.guid, f) });
          part = part.with({ responses: part.responses.set(response.guid, response) });
          difference -= 1;

        }
        if (choiceCount - responseCount > 0) {
          updated = updated.with({ parts: updated.parts.set(part.guid, part) });
        }
      }
    }
  }
  return updated;
}

// If skills are found only at the question level, duplicate them
// at the part level.
// Originally, this migrated from concepts to concepts. After
// adding a new 'skillref' attribute to the DTD, the skills now
// are added to the skills set. This function looks to see if
// the concepts list has any skills present and adds them to the new
// skills set.
function migrateSkillsToParts(model: Question) : Question {

  const partsArray = model.parts.toArray();
  let updated = model;

  const noSkillsAtParts : boolean = partsArray.every(p => p.skills.size === 0);
  const skillsAtQuestion : boolean = model.skills.size > 0 || model.concepts.size > 0;

  if (skillsAtQuestion && noSkillsAtParts) {

    // Handle migrating from either skills or concepts
    const { skills, concepts } = model;
    const from = skills.size > 0 ? skills : Immutable.Set<string>(concepts);

    updated = model.with({
      parts: model.parts.map(p => p.with({ skills: from })).toOrderedMap(),
      skills: Immutable.Set<string>(),
    });
  }

  return updated;

}


// If an explanation is found for a question that has just a short answer,
// migrate that explanation content into a feedback
function migrateExplanationToFeedback(model: Question) : Question {

  const itemsArray = model.items.toArray();
  const partsArray = model.parts.toArray();

  let updated = model;

  const justShortAnswer = itemsArray.length === 1 && itemsArray[0].contentType === 'ShortAnswer';
  const hasPart = partsArray.length === 1;

  if (justShortAnswer && hasPart) {
    const originalExplanation = partsArray[0].explanation;
    const originalReponses = partsArray[0].responses;

    const migratedAlready = originalExplanation.extractPlainText().caseOf({
      just: text => text === 'migrated',
      nothing: () => false,
    });

    if (!migratedAlready) {
      const explanation
        = ContentElements.fromText('migrated', '', ALT_FLOW_ELEMENTS);

      const f = new Feedback().with({ body: originalExplanation });
      const feedback = Immutable.OrderedMap<string, Feedback>()
        .set(f.guid, f);

      const res = originalReponses.size === 0
        ? new Response().with({ match: '*', feedback })
        : originalReponses.first().with({ match: '*', feedback });

      const responses = originalReponses.set(res.guid, res);

      const part = partsArray[0].with({ responses, explanation });
      const parts = updated.parts.set(part.guid, part);
      updated = updated.with({ parts });
    }
  }

  return updated;

}

// Cloning an input question requires that we:
// 1. update the input attribute of all input_ref entities found in the
//    question body to point to the newly assigned item id.
// 2. update the response input attribute to point to the newly assigned
//    item id.
function cloneInputQuestion(question: Question) : Question {

  // The approach here is to gust clone the whole thing first, then
  // go back and post-process to make the updates that we need:

  const cloned = question.with({
    id: createGuid(),
    body: question.body.clone(),
    explanation: question.explanation.clone(),
    parts: question.parts.map(p => p.clone()).toOrderedMap(),
    items: question.items.map(i => i.clone()).toOrderedMap(),
  });

  // Calculate the mapping of old item ids to new item ids
  const itemMap = {};
  const newItems = cloned.items.toArray();
  question.items.toArray().forEach(
    (item, index) => itemMap[(item as any).id] = (newItems[index] as any).id);

  // First do update #1 - update all input_ref input attributes to point
  // to the new item ids
  const body = cloned.body.with({
    content: cloned.body.content.map((c) => {
      if (c.contentType === 'ContiguousText') {
        return (c as ContiguousText).updateAllInputRefs(itemMap);
      }
      return c;
    }).toOrderedMap(),
  });


  // Now do update #2 - set the response input attr to point to the new item id
  const parts = cloned.parts.map((part) => {
    return part.with({
      responses: part.responses.map((response) => {
        if (itemMap[response.input] !== undefined) {
          return response.with({ input: itemMap[response.input] });
        }
        return response;
      }).toOrderedMap(),
    });
  }).toOrderedMap();

  return cloned.with({
    body,
    parts,
  });
}

// Cloning a single select multiple choice question requires that
// we update the choice#value attribute in lock step with the
// response#match attribute:
function cloneMultipleChoiceQuestion(question: Question) : Question {

  // Remap existing value ids to newly assigned ones, storing
  // the mapping in valueMap for later use.
  const valueMap = {};
  const items = question.items.map((item) => {

    // Clone all the choices, but assign new values and track
    // the mapping of old choice values to new ones
    const mc = item as MultipleChoice;
    const choices = mc.choices.map((choice) => {
      const value = createGuid();
      valueMap[choice.value] = value;

      return choice.clone().with({
        value,
      });
    }).toOrderedMap();

    return (item as MultipleChoice).with({
      id: createGuid(),
      choices,
    });
  }).toOrderedMap();

  // Now clone parts, but post process to update the match attribute
  // of response objects to use the new choice values
  const initialPartsClone = question.parts.map(p => p.clone()).toOrderedMap();
  const parts = initialPartsClone.map((part) => {
    return part.with({
      responses: part.responses.map((response) => {
        return response.with({ match: valueMap[response.match] });
      }).toOrderedMap(),
    });
  }).toOrderedMap();

  return question.with({
    id: createGuid(),
    body: question.body.clone(),
    explanation: question.explanation.clone(),
    parts,
    items,
  });
}

export class Question extends Immutable.Record(defaultQuestionParams) {

  contentType: 'Question';
  elementType: 'question';
  id: string;
  body: ContentElements;
  concepts: Immutable.List<string>;
  skills: Immutable.Set<string>;
  grading: string;
  items: Immutable.OrderedMap<string, Item>;
  parts: Immutable.OrderedMap<string, Part>;
  explanation: ContentElements;
  guid: string;

  constructor(params?: QuestionParams) {
    super(augment(params));
  }


  clone() : Question {

    const item = this.items.first();

    // If there isn't a single item, there isn't much
    // to do here at all:
    if (item === undefined) {
      return this.with({
        id: createGuid(),
        body: this.body.clone(),
        explanation: this.explanation.clone(),
      });
    }

    // Otherwise, use first item to determine the
    // question type because we have to handle single select
    // multiple choice questions and any input-based questions specially
    if (item.contentType === 'MultipleChoice' && item.select === 'single') {
      return cloneMultipleChoiceQuestion(this);
    }
    if (item.contentType === 'Numeric'
      || item.contentType === 'Text'
      || item.contentType === 'FillInTheBlank') {
      return cloneInputQuestion(this);
    }

    // All other question types can get by with just a top-down clone:
    return this.with({
      id: createGuid(),
      body: this.body.clone(),
      explanation: this.explanation.clone(),
      items: this.items.map(i => i.clone()).toOrderedMap(),
      parts: this.parts.map(p => p.clone()).toOrderedMap(),
    });
  }

  with(values: QuestionParams) {
    return this.merge(values) as this;
  }

  removeInputRef(itemModelId: string)
    : Question {

    const content = this.body.content.map((c) => {
      if (c.contentType === 'ContiguousText') {
        return (c as ContiguousText).removeInputRef(itemModelId);
      }
      return c;
    }).toOrderedMap();

    const body = this.body.with({ content });

    return this.with({ body });
  }

  static emptyBody() {
    return ContentElements.fromText('', '', QUESTION_BODY_ELEMENTS);
  }

  static fromPersistence(json: any, guid: string) {

    let model = new Question({ guid });

    const question = json.question;

    if (question['@id'] !== undefined) {
      model = model.with({ id: question['@id'] });
    }
    if (question['@grading'] !== undefined) {
      model = model.with({ grading: question['@grading'] });
    }

    let body = null;

    getChildren(question).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'cmd:concept':
          model = model.with(
            { concepts: model.concepts.push((item as any)['cmd:concept']['#text']) });
          break;
        case 'body':
          body = item;
          break;
        case 'essay':
          model = model.with({ items: model.items.set(id, Essay.fromPersistence(item, id)) });
          break;
        case 'fill_in_the_blank':
          model = model.with(
            { items: model.items.set(id, FillInTheBlank.fromPersistence(item, id)) });
          break;
        // We do not yet support image_hotspot:
        case 'image_hotspot':
          model = model.with({ items: model.items.set(id, Unsupported.fromPersistence(item, id)) });
          break;
        case 'multiple_choice':
          model = model.with(
            { items: model.items.set(id, MultipleChoice.fromPersistence(item, id)) });
          break;
        case 'numeric':
          model = model.with({ items: model.items.set(id, Numeric.fromPersistence(item, id)) });
          break;
        case 'ordering':
          model = model.with({ items: model.items.set(id, Ordering.fromPersistence(item, id)) });
          break;
        case 'part':
          model = model.with({ parts: model.parts.set(id, Part.fromPersistence(item, id)) });
          break;
        case 'responses':
          // read weird legacy format where individual response elements are under a
          // 'responses' element instead of a 'part'
          const copy = Object.assign({}, item);
          copy['part'] = copy['responses'];
          model = model.with({ parts: model.parts.set(id, Part.fromPersistence(copy, id)) });
          break;
        case 'explanation':
          model = model.with({ explanation:
            ContentElements.fromPersistence((item as any).explanation, id, ALT_FLOW_ELEMENTS) });
          break;
        case 'skillref':
          model = model.with({ skills: model.skills.add((item as any).skillref['@idref']) });
          break;
        case 'short_answer':
          model = model.with({ items: model.items.set(id, ShortAnswer.fromPersistence(item, id)) });
          break;
        case 'text':
          model = model.with({ items: model.items.set(id, Text.fromPersistence(item, id)) });
          break;
        default:

      }
    });

    if (body !== null) {

      const backingTextProvider = buildItemMap(model);
      model = model.with({ body: ContentElements.fromPersistence(
        body['body'], createGuid(), QUESTION_BODY_ELEMENTS, backingTextProvider) });
    }


    return migrateExplanationToFeedback(
        ensureResponsesExist(migrateSkillsToParts(model)));
  }

  toPersistence() : Object {

    // For a question with no items, serialize with a default one
    const itemsAndParts = this.items.size === 0
      ? [defaultItem, defaultPart]
      : [...this.items
          .toArray()
          .map(item => item.toPersistence()),
        ...this.parts
          .toArray()
          .map(part => part.toPersistence())];

    const children = [

      { body: { '#array': this.body.toPersistence() } },

      ...this.concepts
        .toArray()
        .map(concept => ({ 'cmd:concept': { '#text': concept } })),

      ...this.skills
        .toArray()
        .map(skill => ({ skillref: { '@idref': skill } })),

      ...itemsAndParts,

      { explanation: { '#array': this.explanation.toPersistence() } },
    ];

    return {
      question: {
        '@id': this.id,
        '@grading': this.grading,
        '#array': children,
      },
    };
  }
}
