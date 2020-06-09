import * as Immutable from 'immutable';
import { augment, setId, ensureIdGuidPresent } from '../common';

export type TextParams = {
  id? : string,
  name? : string,
  caseSensitive?: boolean;
  whitespace?: string;
  inputSize?: string;
  guid?: string;
  evaluation?: string;
  keyboard?: string;
};

const defaultContent = {
  contentType: 'Text',
  elementType: 'text',
  id: '',
  name: '',
  caseSensitive: false,
  whitespace: 'trim',
  inputSize: 'small',
  guid: '',
  evaluation: 'regex',
  keyboard: 'none',
};

export class Text extends Immutable.Record(defaultContent) {

  contentType: 'Text';
  elementType: 'text';
  id : string;
  name : string;
  caseSensitive: boolean;
  whitespace: string;
  inputSize: string;
  guid: string;
  evaluation: string; // 'regex' | 'latex' | 'numeric_computation'
  keyboard: string;   // 'none' | 'math' | 'chemistry'

  constructor(params?: TextParams) {
    super(augment(params));
  }

  clone() : Text {
    return ensureIdGuidPresent(this);
  }

  with(values: TextParams) {
    return this.merge(values) as this;
  }

  isMathText() : boolean { 
    return (this.evaluation === 'latex' || this.evaluation === 'numeric_computation');
  }

  static fromPersistence(json: Object, guid: string, notify: () => void) : Text {

    const n = (json as any).text;
    let model = new Text({ guid });

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
    if (n['@size'] !== undefined) {
      model = model.with({ inputSize: n['@size'] });
    }
    if (n['@evaluation'] !== undefined) {
      model = model.with({ evaluation: n['@evaluation'] });
    }
    if (n['@keyboard'] !== undefined) {
      model = model.with({ keyboard: n['@keyboard'] });
    }
    

    return model;

  }

  toPersistence() : Object {

    return {
      text: {
        '@id': this.id,
        '@name': this.name,
        '@size': this.inputSize,
        '@whitespace': this.whitespace,
        '@case_sensitive': this.caseSensitive,
        '@evaluation': this.evaluation,
        '@keyboard': this.keyboard,
      },
    };
  }
}
