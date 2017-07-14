import * as Immutable from 'immutable';
import { Html } from '../html';
import { Title } from '../title';
import { Response } from './response';
import { ResponseMult } from './response_mult';
import { GradingCriteria } from './criteria';
import { Hint } from './hint';
import { getChildren, augment } from '../common';

import createGuid from '../../../utils/guid';
import { getKey } from '../../common';

export type PartParams = {
  id?: string;
  correct?: string;
  scoreOutOf?: string;
  targets?: string;
  title?: Title;
  concepts?: Immutable.List<string>;
  responses?: Immutable.OrderedMap<string, Response>;
  responseMult?: Immutable.OrderedMap<string, ResponseMult>;
  criteria?: Immutable.OrderedMap<string, GradingCriteria>;
  hints?: Immutable.OrderedMap<string, Hint>;
  explanation?: Html;
  guid?: string;
};

const defaultPartParams = {
  contentType: 'Part',
  id: '',
  correct: '',
  scoreOutOf: '',
  targets: '',
  title: new Title(),
  concepts: Immutable.List<string>(),
  criteria: Immutable.OrderedMap<string, GradingCriteria>(),
  responses: Immutable.OrderedMap<string, Response>(),
  responseMult: Immutable.OrderedMap<string, ResponseMult>(),
  hints: Immutable.OrderedMap<string, Hint>(),
  explanation: new Html(),
  guid: '',
};

export class Part extends Immutable.Record(defaultPartParams) {

  contentType: 'Part';
  id: string;
  correct: string;
  scoreOutOf: string;
  targets: string;
  title: Title;
  concepts: Immutable.List<string>;
  criteria: Immutable.OrderedMap<string, GradingCriteria>;
  responses: Immutable.OrderedMap<string, Response>;
  responseMult: Immutable.OrderedMap<string, ResponseMult>;
  hints: Immutable.OrderedMap<string, Hint>;
  explanation: Html;
  guid: string;
  
  constructor(params?: PartParams) {
    super(augment(params));
  }

  with(values: PartParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string) {

    let model = new Part({ guid });

    const part = json.part;

    if (part['@id'] !== undefined) {
      model = model.with({ id: part['@id'] });
    }
    if (part['@correct'] !== undefined) {
      model = model.with({ correct: part['@correct'] });
    }
    if (part['@score_out_of'] !== undefined) {
      model = model.with({ scoreOutOf: part['@score_out_of'] });
    }
    if (part['@targets'] !== undefined) {
      model = model.with({ targets: part['@targets'] });
    }

    getChildren(part).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'grading_criteria':
          model = model.with(
            { criteria: model.criteria.set(id, GradingCriteria.fromPersistence(item, id)) });
          break;
        
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id) });
          break;
        case 'concept':
          model = model.with({ concepts: model.concepts.push((item as any).concept['#text']) });
          break;
        case 'response':
          model = model.with(
            { responses: model.responses.set(id, Response.fromPersistence(item, id)) });
          break;
        case 'response_mult':
          model = model.with(
            { responseMult: model.responseMult.set(id, ResponseMult.fromPersistence(item, id)) });
          break;
        case 'hint':
          model = model.with({ hints: model.hints.set(id, Hint.fromPersistence(item, id)) });
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

    const explanation = this.explanation.toPersistence();

    const children = [
      
      this.title.toPersistence(),

      ...this.concepts
        .toArray()
        .map(concept => ({ concept: { '#text': concept } })),

      ...this.responses
        .toArray()
        .map(response => response.toPersistence()),

      ...this.criteria
        .toArray()
        .map(item => item.toPersistence()),

      ...this.responseMult
        .toArray()
        .map(response => response.toPersistence()),

      ...this.hints
        .toArray()
        .map(hint => hint.toPersistence()),

      { explanation },
    ];

    const part = {
      part: {
        '@id': this.id,
        '@targets': this.targets,
        '#array': children,
      },
    };

    if (this.correct.trim() !== '') {
      part.part['@correct'] = this.correct.trim();
    }
    if (this.scoreOutOf.trim() !== '') {
      part.part['@score_out_of'] = this.scoreOutOf.trim();
    }

    return part;
  }
}
