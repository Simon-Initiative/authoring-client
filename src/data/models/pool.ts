import * as Immutable from 'immutable';

import * as types from '../types';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { ResourceId } from 'data/types';

export type PoolModelParams = {
  guid?: types.ResourceGuid,
  id?: types.ResourceId,
  resource?: contentTypes.Resource,
  type?: string,
  lock?: contentTypes.Lock,
  icon?: contentTypes.WebContent,
  pool?: contentTypes.Pool,
};

const defaultPoolModel = {
  modelType: 'PoolModel',
  resource: new contentTypes.Resource(),
  guid: types.ResourceGuid.of(''),
  id: types.ResourceId.of(''),
  type: types.LegacyTypes.assessment2_pool,
  icon: new contentTypes.WebContent(),
  lock: new contentTypes.Lock(),
  pool: new contentTypes.Pool({ id: ResourceId.of(guid()) }),
};

export class PoolModel extends Immutable.Record(defaultPoolModel) {
  modelType: 'PoolModel';
  guid: types.ResourceGuid;
  id: types.ResourceId;
  resource: contentTypes.Resource;
  type: string;
  lock: contentTypes.Lock;
  icon: contentTypes.WebContent;
  pool: contentTypes.Pool;

  constructor(params?: PoolModelParams) {
    params ? super(params) : super();
  }

  with(values: PoolModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, notify: () => void): PoolModel {

    let model = new PoolModel();

    const p = (json as any);
    model = model.with({
      resource: contentTypes.Resource.fromPersistence(p),
    });
    model = model.with({ type: p.type });
    if (p.lock !== undefined && p.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(p.lock) });
    }

    let pool = null;
    if (p.doc instanceof Array) {
      pool = p.doc[0];
    } else {
      pool = p.doc;
    }

    model = model.with({ pool: contentTypes.Pool.fromPersistence(pool, '', notify) });

    return model;
  }

  toPersistence(): Object {

    const doc = [this.pool.toPersistence()];
    const values = {
      modelType: 'PoolModel',
      id: this.pool.id.value(),
      title: this.pool.title.text,
      type: this.type,
      doc,
    };
    return values;
  }
}
