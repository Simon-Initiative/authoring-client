import * as Immutable from 'immutable';
import { Html } from './html';
import { Part } from './part';
import { MultipleChoice } from './multiple_choice';
import { Unsupported } from './unsupported';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { getChildren } from './common';

export type Item = MultipleChoice | Unsupported;

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
  id: createGuid(),
  body: new Html(),
  concepts: Immutable.List<string>(),
  items: Immutable.OrderedMap<string, Item>(),
  parts: Immutable.OrderedMap<string, Part>(),
  explanation: new Html(),
  guid: createGuid()
};

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
    params ? super(params) : super();
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
        
        // We do not yet support these question item.types:
        case 'fill_in_the_blank':
        case 'ordering':
        case 'numeric':
        case 'text':
        case 'short_answer':
        case 'image_hotspot':
        case 'fill_in_the_blank':
          model = model.with({ items: model.items.set(id, Unsupported.fromPersistence(item, id)) });
          break;
        case 'explanation':
          model = model.with({ explanation: Html.fromPersistence((item as any).explanation, id) });
          break;
        default:
          
      }
    });

    return model;
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