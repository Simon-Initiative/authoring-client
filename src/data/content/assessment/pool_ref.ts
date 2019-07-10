import * as Immutable from 'immutable';
import { augment } from '../common';
import { ResourceId } from 'data/types';

export type PoolRefParams = {
  idref?: ResourceId;
  guid?: string;
};

const defaultPoolRefParams = {
  contentType: 'PoolRef',
  elementType: 'pool_ref',
  idref: ResourceId.of(''),
  guid: '',
};

export class PoolRef extends Immutable.Record(defaultPoolRefParams) {

  contentType: 'PoolRef';
  elementType: 'pool_ref';
  idref: ResourceId;
  guid: string;

  constructor(params?: PoolRefParams) {
    super(augment(params));
  }

  with(values: PoolRefParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void) {

    let model = new PoolRef({ guid });

    const s = json.pool_ref;

    if (s['@idref'] !== undefined) {
      model = model.with({ idref: ResourceId.of(s['@idref']) });
    }

    return model;
  }

  toPersistence(): Object {

    return {
      pool_ref: {
        '@idref': this.idref.value(),
      },
    };
  }
}
