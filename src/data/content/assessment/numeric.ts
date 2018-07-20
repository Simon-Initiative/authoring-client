import * as Immutable from 'immutable';
import { augment, setId } from '../common';
import createGuid from 'utils/guid';

export type NumericParams = {
  id? : string,
  name? : string,
  notation?: string;
  inputSize?: string;
  guid?: string
};

const defaultContent = {
  contentType: 'Numeric',
  elementType: 'numeric',
  id: '',
  name: '',
  notation: 'automatic',
  inputSize: 'small',
  guid: '',
};

export class Numeric extends Immutable.Record(defaultContent) {

  contentType: 'Numeric';
  elementType: 'numeric';
  id : string;
  name : string;
  notation: string;
  inputSize: string;
  guid: string;

  constructor(params?: NumericParams) {
    super(augment(params));
  }

  clone() : Numeric {
    return this.with({
      id: createGuid(),
    });
  }

  with(values: NumericParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void) : Numeric {

    const n = (json as any).numeric;
    let model = new Numeric({ guid });

    model = setId(model, n, notify);

    if (n['@name'] !== undefined) {
      model = model.with({ name: n['@name'] });
    }
    if (n['@size'] !== undefined) {
      model = model.with({ inputSize: n['@size'] });
    }
    if (n['@notation'] !== undefined) {
      model = model.with({ notation: n['@notation'] });
    }

    return model;

  }

  toPersistence() : Object {

    return {
      numeric: {
        '@id': this.id,
        '@size': this.inputSize,
        '@notation': this.notation,
      },
    };
  }
}
