import * as Immutable from 'immutable';

import { ContentState, ContentBlock, convertToRaw } from 'draft-js';

import { Html } from './html';
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
import { Unsupported } from './unsupported';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { getChildren, augment } from './common';
import { getEntities } from './html/changes';
import { EntityTypes } from './html/common';

export type Item = MultipleChoice | FillInTheBlank | Ordering | Essay
  | ShortAnswer | Numeric | Text | Unsupported;

export type QuestionParams = {
  id?: string;
  body?: Html;
  concepts?: Immutable.List<string>;
  grading?: string;
  criteria?: Immutable.OrderedMap<string, GradingCriteria>;
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
  criteria: Immutable.OrderedMap<string, GradingCriteria>(),
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
      } else {
        return p;
      }
    }, 
    {});

  const contentState = getEntities(EntityTypes.input_ref, model.body.contentState)
    .reduce(
      (contentState, info) => {
        if (byId[info.entity.data['@input']] !== undefined) {
          const type = byId[info.entity.data['@input']].contentType;
          return contentState.mergeEntityData(info.entityKey, { $type: type });
        } else {
          return contentState;
        }
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
  return updated;
}

export class Question extends Immutable.Record(defaultQuestionParams) {

  contentType: 'Question';
  id: string;
  body: Html;
  concepts: Immutable.List<string>;
  criteria: Immutable.OrderedMap<string, GradingCriteria>;
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
        case 'concept':
          model = model.with({ concepts: model.concepts.push((item as any).concept['#text']) });
          break;
        case 'grading_criteria':
          model = model.with(
            { criteria: model.criteria.set(id, GradingCriteria.fromPersistence(item, id)) });
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

    return ensureResponsesExist(tagInputRefsWithType(model));
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
        .map(concept => ({ concept: { '#text': concept } })),

      ...this.criteria
        .toArray()
        .map(item => item.toPersistence()),
 
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
