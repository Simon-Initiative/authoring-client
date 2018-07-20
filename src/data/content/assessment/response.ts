import * as Immutable from 'immutable';

import { Feedback } from './feedback';
import createGuid from '../../../utils/guid';
import { getKey } from '../../common';
import { augment, getChildren } from '../common';

const encodeMatchOperators = (match: string) => {
  const operatorEncodings = {
    '<': '&lt;',
    '>': '&gt;',
  };

  return Object.keys(operatorEncodings).reduce(
    (match, encKey) => match.replace(encKey, operatorEncodings[encKey]),
    match);
};

const decodeMatchOperators = (match: string) => {
  const operatorDecodings = {
    '&lt;': '<',
    '&gt;': '>',
  };

  return Object.keys(operatorDecodings).reduce(
    (match, decKey) => match.replace(decKey, operatorDecodings[decKey]),
    match);
};

const sanitizeMatch = (match: string) => {
  // remove trailing # if no precision value is defined
  return match.substr(match.length - 1, 1) === '#'
    ? match.substr(0, match.length - 1)
    : match;
};

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
      model = model.with({ match: decodeMatchOperators(r['@match']) });
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
        '@match': encodeMatchOperators(sanitizeMatch(this.match)),
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
