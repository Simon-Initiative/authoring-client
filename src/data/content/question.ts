import * as Immutable from 'immutable';

import { ContentState, ContentBlock, convertToRaw } from 'draft-js';

import { Html } from './html';
import { Part } from './part';
import { MultipleChoice } from './multiple_choice';
import { FillInTheBlank } from './fill_in_the_blank';
import { Numeric } from './numeric';
import { Unsupported } from './unsupported';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { getChildren } from './common';
import { augment } from './common';
import { getEntities } from './html/changes';
import { EntityTypes } from './html/common';

export type Item = MultipleChoice | FillInTheBlank | Numeric | Unsupported;

export type QuestionParams = {
  id?: string;
  body?: Html;
  concepts?: Immutable.List<string>;
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
  items: Immutable.OrderedMap<string, Item>(),
  parts: Immutable.OrderedMap<string, Part>(),
  explanation: new Html(),
  guid: ''
};

// Find all input ref tags and add a '$type' attribute to its data
// to indicate the type of the item
function tagInputRefsWithType(model: Question) {
  
  const byId = model.items.toArray().reduce((p, c) => {
    if ((c as any).id !== undefined) {
      p[(c as any).id] = c;
      return p;
    }
  }, {});

  const contentState = getEntities(EntityTypes.input_ref, model.body.contentState)
    .reduce((contentState, info) => {
      console.log(info);
      const type = byId[info.entity.data['@input']].contentType;
      return contentState.mergeEntityData(info.entityKey, { '$type':  type});
    }, model.body.contentState);

  const body = model.body.with({contentState});
  return model.with({body});
}

export class Question extends Immutable.Record(defaultQuestionParams) {

  contentType: 'Question';
  id: string;
  body: Html;
  concepts: Immutable.List<string>;
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

    let question = json.question;

    if (question['@id'] !== undefined) {
      model = model.with({ id: question['@id']});
    }

    getChildren(question).forEach(item => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'concept':
          model = model.with({ concepts: model.concepts.push((item as any).concept['#text'])});
          break;
        case 'body':
          model = model.with({ body: Html.fromPersistence(item, id) });
          break;
        case 'part':
          model = model.with({ parts: model.parts.set(id, Part.fromPersistence(item, id)) });
          break;
        case 'multiple_choice':
          model = model.with({ items: model.items.set(id, MultipleChoice.fromPersistence(item, id)) });
          break;
        case 'fill_in_the_blank':
          model = model.with({ items: model.items.set(id, FillInTheBlank.fromPersistence(item, id)) });
          break;
        case 'numeric':
          model = model.with({ items: model.items.set(id, Numeric.fromPersistence(item, id)) });
          break;
          
        // We do not yet support these question item.types:
        case 'ordering':
        case 'text':
        case 'short_answer':
        case 'image_hotspot':
          model = model.with({ items: model.items.set(id, Unsupported.fromPersistence(item, id)) });
          break;
        case 'explanation':
          model = model.with({ explanation: Html.fromPersistence((item as any).explanation, id) });
          break;
        default:
          
      }
    });

    return tagInputRefsWithType(model);
  }

  toPersistence() : Object {

    const children = [
      
      { body: this.body.toPersistence() },

      ...this.concepts
        .toArray()
        .map(concept => ({concept: { '#text': concept}})),

      ...this.items
        .toArray()
        .map(item => item.toPersistence()),
      
      ...this.parts
        .toArray()
        .map(part => part.toPersistence()),

      { explanation: this.explanation.toPersistence() }
    ];

    return {
      "question": {
        "@id": this.id,
        "#array": children
      }
    }
  }
}