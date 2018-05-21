import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import * as types from './types';
import { Dependency } from './dependency';
import createGuid from '../../../utils/guid';

export type DependenciesParams = {
  dependencies?: Immutable.OrderedMap<string, Dependency>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Dependencies,
  elementType: 'dependencies',
  dependencies: Immutable.OrderedMap<string, Dependency>(),
  guid: '',
};

export class Dependencies extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Dependencies;
  elementType: 'dependencies';
  dependencies?: Immutable.OrderedMap<string, Dependency>;
  guid: string;

  constructor(params?: DependenciesParams) {
    super(augment(params));
  }

  with(values: DependenciesParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).dependencies;
    let model = new Dependencies({ guid });

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'dependency':
          model = model.with(
            { dependencies: model.dependencies.set(id, Dependency.fromPersistence(item, id)) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const s = {
      dependencies: {
        '#array': this.dependencies.toArray().map(s => s.toPersistence()),
      },
    };

    return s;
  }
}
