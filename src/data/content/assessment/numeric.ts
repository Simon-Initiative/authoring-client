import * as Immutable from 'immutable';

import { Choice } from './choice';
import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';


export type NumericParams = {
  id? : string,
  name? : string,
  notation?: string;
  inputSize?: string;
  guid?: string
};

const defaultContent = {
  id: '',
  name: '',
  notation: 'automatic',
  inputSize: 'small',
  guid: '',
  contentType: 'Numeric',
};

export class Numeric extends Immutable.Record(defaultContent) {
  
  contentType: 'Numeric';
  id : string;
  name : string;
  notation: string;
  inputSize: string;
  guid: string;
  
  constructor(params?: NumericParams) {
    super(augment(params));
  }

  with(values: NumericParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : Numeric {
    
    const n = (json as any).numeric;
    let model = new Numeric({ guid });

    if (n['@id'] !== undefined) {
      model = model.with({ id: n['@id'] });
    }
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
