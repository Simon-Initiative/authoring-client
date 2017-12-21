import * as Immutable from 'immutable';
import { augment } from '../common';

export type PoolRefParams = {
  idref?: string;
  guid?: string;
};

const defaultPoolRefParams = {
  contentType: 'PoolRef',
  idref: '',
  guid: '',
};

export class PoolRef extends Immutable.Record(defaultPoolRefParams) {

  contentType: 'PoolRef';
  idref: string;
  guid: string;
  
  constructor(params?: PoolRefParams) {
    super(augment(params));
  }

  with(values: PoolRefParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string) {

    let model = new PoolRef({ guid });

    const s = json.pool_ref;

    if (s['@idref'] !== undefined) {
      model = model.with({ idref: s['@idref'] });
    }
    
    return model;
  }

  toPersistence() : Object {

    return {
      pool_ref: {
        '@idref': this.idref,
      },
    };
  }
}
