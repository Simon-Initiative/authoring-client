import * as Immutable from 'immutable';

import { ContentState, ContentBlock, convertToRaw } from 'draft-js';

import { Html } from '../html';
import { Part } from './part';
import { MultipleChoice } from './multiple_choice';
import { FillInTheBlank } from './fill_in_the_blank';
import { Ordering } from './ordering';
import { Text } from './text';
import { ShortAnswer } from './short_answer';
import { GradingCriteria } from './criteria';
import { Essay } from './essay';
import { Numeric } from './numeric';
import { Feedback } from './feedback';
import { Response } from './response';
import { Unsupported } from '../unsupported';
import createGuid from '../../../utils/guid';
import { getKey } from '../../common';
import { getChildren, augment } from '../common';
import { getEntities } from '../html/changes';
import { EntityTypes } from '../html/common';

export type Item = MultipleChoice | FillInTheBlank | Ordering | Essay
  | ShortAnswer | Numeric | Text | Unsupported;

export type QuestionParams = {
  id?: string;
  body?: Html;
  concepts?: Immutable.List<string>;
  grading?: string;
  items?: Immutable.OrderedMap<string, Item>;
  parts?: Immutable.OrderedMap<string, Part>;
  explanation?: Html;
  guid?: string;
};

const defaultQuestionParams = {
  contentType: 'Question',
  id: '',
  body: new Html(),
  concepts: Immutable.List<string>(),
  grading: 'automatic',
  items: Immutable.OrderedMap<string, Item>(),
  parts: Immutable.OrderedMap<string, Part>(),
  explanation: new Html(),
  guid: '',
};

const defaultItem = new ShortAnswer().toPersistence();
const defaultPart = new Part().toPersistence();

// Find all input ref tags and add a '$type' attribute to its data
// to indicate the type of the item
function tagInputRefsWithType(model: Question) {

  const byId = model.items.toArray().reduce(
    (p, c) => {
      if ((c as any).id !== undefined) {
        p[(c as any).id] = c;
        return p;
      }

      return p;
    },
    {});

  const contentState = getEntities(EntityTypes.input_ref, model.body.contentState)
    .reduce(
      (contentState, info) => {
        if (byId[info.entity.data['@input']] !== undefined) {
          const type = byId[info.entity.data['@input']].contentType;
          return contentState.mergeEntityData(info.entityKey, { $type: type });
        }

        return contentState;
      },
      model.body.contentState);

  const body = model.body.with({ contentState });
  return model.with({ body });
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
// at the part level
function migrateSkillsToParts(model: Question) : Question {

  const partsArray = model.parts.toArray();
  let updated = model;

  const noSkillsAtParts : boolean = partsArray.every(p => p.concepts.size === 0);
  const skillsAtQuestion : boolean = model.concepts.size > 0;

  if (skillsAtQuestion && noSkillsAtParts) {

    const { concepts } = model;

    updated = model.with({
      parts: model.parts.map(p => p.with({ concepts })).toOrderedMap(),
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
    const so = itemsArray[0] as ShortAnswer;
    const originalExplanation = partsArray[0].explanation;
    const originalReponses = partsArray[0].responses;

    const migratedAlready = originalExplanation.contentState.getBlocksAsArray().length === 1
      && originalExplanation.contentState.getBlocksAsArray()[0].text === 'migrated';

    if (!migratedAlready) {
      const explanation
        = new Html().with({ contentState: ContentState.createFromText('migrated') });

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

export class Question extends Immutable.Record(defaultQuestionParams) {

  contentType: 'Question';
  id: string;
  body: Html;
  concepts: Immutable.List<string>;
  grading: string;
  items: Immutable.OrderedMap<string, Item>;
  parts: Immutable.OrderedMap<string, Part>;
  explanation: Html;
  guid: string;

  constructor(params?: QuestionParams) {
    super(augment(params));
  }

  with(values: QuestionParams) {
    return this.merge(values) as this;
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

    getChildren(question).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'responses':
          // read weird legacy format where individual response elements are under a
          // 'responses' element instead of a 'part'
          const copy = Object.assign({}, item);
          copy['part'] = copy['responses'];

          model = model.with({ parts: model.parts.set(id, Part.fromPersistence(copy, id)) });

          break;
        case 'concept':
          model = model.with({ concepts: model.concepts.push((item as any).concept['#text']) });
          break;
        case 'cmd:concept':
          model = model.with(
            { concepts: model.concepts.push((item as any)['cmd:concept']['#text']) });
          break;

        case 'body':
          model = model.with({ body: Html.fromPersistence(item, id) });
          break;
        case 'part':
          model = model.with({ parts: model.parts.set(id, Part.fromPersistence(item, id)) });
          break;
        case 'multiple_choice':
          model = model.with(
            { items: model.items.set(id, MultipleChoice.fromPersistence(item, id)) });
          break;
        case 'fill_in_the_blank':
          model = model.with(
            { items: model.items.set(id, FillInTheBlank.fromPersistence(item, id)) });
          break;
        case 'numeric':
          model = model.with({ items: model.items.set(id, Numeric.fromPersistence(item, id)) });
          break;
        case 'text':
          model = model.with({ items: model.items.set(id, Text.fromPersistence(item, id)) });
          break;
        case 'short_answer':
          model = model.with({ items: model.items.set(id, ShortAnswer.fromPersistence(item, id)) });
          break;
        case 'ordering':
          model = model.with({ items: model.items.set(id, Ordering.fromPersistence(item, id)) });
          break;
        case 'essay':
          model = model.with({ items: model.items.set(id, Essay.fromPersistence(item, id)) });
          break;

        // We do not yet support image_hotspot:
        case 'image_hotspot':
          model = model.with({ items: model.items.set(id, Unsupported.fromPersistence(item, id)) });
          break;
        case 'explanation':
          model = model.with({ explanation: Html.fromPersistence((item as any).explanation, id) });
          break;
        default:

      }
    });

    return migrateExplanationToFeedback(
        ensureResponsesExist(tagInputRefsWithType(migrateSkillsToParts(model))));
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

      { body: this.body.toPersistence() },

      ...this.concepts
        .toArray()
        .map(concept => ({ 'cmd:concept': { '#text': concept } })),

      ...itemsAndParts,

      { explanation: this.explanation.toPersistence() },
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
