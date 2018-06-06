import * as Immutable from 'immutable';
import { augment } from '../common';
import createGuid from 'utils/guid';

export type ShortAnswerParams = {
  id? : string,
  name? : string,
  caseSensitive?: boolean;
  whitespace?: string;
  guid?: string
};

const defaultContent = {
  contentType: 'ShortAnswer',
  elementType: 'short_answer',
  id: '',
  name: '',
  caseSensitive: false,
  whitespace: 'trim',
  guid: '',
};

export class ShortAnswer extends Immutable.Record(defaultContent) {

  contentType: 'ShortAnswer';
  elementType: 'short_answer';
  id : string;
  name : string;
  caseSensitive: boolean;
  whitespace: string;
  guid: string;

  constructor(params?: ShortAnswerParams) {
    super(augment(params));
  }

  clone() : ShortAnswer {
    return this.with({
      id: createGuid(),
    });
  }

  with(values: ShortAnswerParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : ShortAnswer {

    const n = (json as any).short_answer;
    let model = new ShortAnswer({ guid });

    if (n['@id'] !== undefined) {
      model = model.with({ id: n['@id'] });
    }
    if (n['@name'] !== undefined) {
      model = model.with({ name: n['@name'] });
    }
    if (n['@whitespace'] !== undefined) {
      model = model.with({ whitespace: n['@whitespace'] });
    }
    if (n['@case_sensitive'] !== undefined) {
      model = model.with({ caseSensitive: n['@case_sensitive'] });
    }

    return model;

  }

  toPersistence() : Object {

    return {
      short_answer: {
        '@id': this.id,
        '@name': this.name,
        '@whitespace': this.whitespace,
        '@case_sensitive': this.caseSensitive,
      },
    };
  }
}
