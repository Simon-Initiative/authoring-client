import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isNullOrUndefined, isArray } from 'util';

export type DefaultModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string,
  content?: string,
  lock?: contentTypes.Lock,
};

const defaultModelParams = {
  modelType: 'DefaultModel',
  resource: new contentTypes.Resource(),
  guid: '',
  type: '',
  content: '',
  lock: new contentTypes.Lock(),
};

export class DefaultModel extends Immutable.Record(defaultModelParams) {
  modelType: 'DefaultModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  content: string;
  lock: contentTypes.Lock;

  constructor(params?: DefaultModelParams) {
    params ? super(params) : super();
  }

  with(values: DefaultModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): DefaultModel {
    let model = new DefaultModel();

    const info = (json as any);
    model = model.with({ resource: contentTypes.Resource.fromPersistence(info) });
    model = model.with({ guid: info.guid });
    model = model.with({ type: info.type });
    if (info.lock !== undefined && info.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(info.lock) });
    }
    model.with({ content: info.doc });

    return model;
  }

  toPersistence(): Object {
    const resource: any = this.resource.toPersistence();
    const doc = [
      this.content,
    ];

    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}
