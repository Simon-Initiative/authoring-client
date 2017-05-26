import * as Immutable from 'immutable';

import * as types from '../types';
import * as contentTypes from '../contentTypes';
import { getKey } from '../common';
import guid from '../../utils/guid';

import { Resource } from '../resource';
import { WebContent } from '../webcontent';

export type PoolModelParams = {
  guid?: string,
  id?: string,
  resource?: Resource,
  type?: string,
  lock?: contentTypes.Lock,
  icon?: WebContent,
  pool?: contentTypes.Pool,
};

const defaultPoolModel = {
  modelType: 'PoolModel',
  rev: 0,
  guid: '',
  id: '',
  type: 'x-oli-pool',
  icon: new WebContent(),
  lock: new contentTypes.Lock(),
  pool: new contentTypes.Pool(),
};

export class PoolModel extends Immutable.Record(defaultPoolModel) {
  modelType: 'PoolModel';
  guid: string;
  id: string;
  resource: Resource;
  type: string;
  lock: contentTypes.Lock;
  icon: WebContent;
  pool: contentTypes.Pool;

  constructor(params?: PoolModelParams) {
    params ? super(params) : super();
  }

  with(values: PoolModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): PoolModel {
    
    let model = new PoolModel();

    const p = (json as any);
    model = model.with({ resource: Resource.fromPersistence(p) });
    model = model.with({ guid: p.guid });
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

    model = model.with({ pool: contentTypes.Pool.fromPersistence(pool, '') });

    return model;
  }

  toPersistence(): Object {
    const doc = [this.pool.toPersistence()];
    const values = {
      modelType: 'PoolModel',
      id: this.id,
      title: this.pool.title.text,
      type: this.type,
      doc,
    };
    return values;
  }
}