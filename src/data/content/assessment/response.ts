import * as Immutable from 'immutable';

import { Feedback } from './feedback';
import createGuid from '../../../utils/guid';
import { getKey } from '../../common';
import { augment, getChildren } from '../common';

export type ResponseParams = {

  feedback? : Immutable.OrderedMap<string, Feedback>,
  concepts? : Immutable.List<string>,
  input? : string,
  match? : string,
  score? : string,
  name? : string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Response',
  elementType: 'response',
  feedback : Immutable.OrderedMap<string, Feedback>(),
  concepts : Immutable.List<string>(),
  input : '',
  match : '',
  score : '0',
  name : '',
  guid: '',
};

export class Response extends Immutable.Record(defaultContent) {

  contentType: 'Response';
  elementType: 'response';
  feedback : Immutable.OrderedMap<string, Feedback>;
  concepts : Immutable.List<string>;
  input : string;
  match : string;
  score : string;
  name : string;
  guid: string;

  constructor(params?: ResponseParams) {
    super(augment(params));
  }


  clone() : Response {
    return this.with({
      feedback: this.feedback.map(f => f.clone()).toOrderedMap(),
    });
  }


  with(values: ResponseParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void) : Response {

    const r = (json as any).response;
    let model = new Response({ guid });

    if (r['@input'] !== undefined) {
      model = model.with({ input: r['@input'] });
    }
    if (r['@name'] !== undefined) {
      model = model.with({ name: r['@name'] });
    }
    if (r['@match'] !== undefined) {
      model = model.with({ match: r['@match'] });
    }
    if (r['@score'] !== undefined) {
      model = model.with({ score: r['@score'] });
    }

    getChildren(r).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'concept':
          model = model.with({ concepts: model.concepts.push(item['#text']) });
          break;
        case 'feedback':
          model = model.with(
            { feedback: model.feedback.set(
              id, Feedback.fromPersistence(item, id, notify))});
          break;
        default:
      }
    });

    // We need to have at least one feedback
    if (model.feedback.size === 0) {
      const empty = Feedback.fromText('', createGuid());
      let feedback =
        Immutable.OrderedMap<string, Feedback>();
      feedback = feedback.set(empty.guid, empty);
      model = model.with({ feedback });
    }

    return model;

  }

  toPersistence() : Object {

    const concepts = this.concepts
        .toArray()
        .map(concept => ({ concept: { '#text': concept } }));

    const feedback = this.feedback
        .toArray()
        .map(f => f.toPersistence());

    const o = {
      response: {
        '@match': this.match,
        '@score': this.score.trim() === '' ? '0' : this.score,
        '@name': this.name,
        '#array': [...concepts, ...feedback],
      },
    };

    if (this.input.trim() !== '') {
      o.response['@input'] = this.input;
    }

    return o;
  }
}
