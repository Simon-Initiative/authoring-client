import * as Immutable from 'immutable';
import { augment } from '../common';
import createGuid from 'utils/guid';

export type TextParams = {
  id? : string,
  name? : string,
  caseSensitive?: boolean;
  whitespace?: string;
  inputSize?: string;
  guid?: string
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

  constructor(params?: TextParams) {
    super(augment(params));
  }

  clone() : Text {
    return this.with({
      id: createGuid(),
    });
  }

  with(values: TextParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : Text {

    const n = (json as any).text;
    let model = new Text({ guid });

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
    if (n['@size'] !== undefined) {
      model = model.with({ inputSize: n['@size'] });
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
      },
    };
  }
}
