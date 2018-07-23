import * as Immutable from 'immutable';
import { augment, setId, ensureIdGuidPresent } from '../common';

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
    return ensureIdGuidPresent(this);
  }

  with(values: ShortAnswerParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void) : ShortAnswer {

    const n = (json as any).short_answer;
    let model = new ShortAnswer({ guid });

    model = setId(model, n, notify);

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
