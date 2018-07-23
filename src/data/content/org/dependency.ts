import * as Immutable from 'immutable';
import { augment } from '../common';
import * as types from './types';

export type DependencyParams = {
  type?: types.DependencyTypes,
  idref?: string,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Dependency,
  elementType: 'dependency',
  type: types.ConditionTypes.None,
  idref: '',
  guid: '',
};

export class Dependency extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Dependency;
  elementType: 'dependency';
  type: types.DependencyTypes;
  idref: string;
  guid: string;

  constructor(params?: DependencyParams) {
    super(augment(params));
  }

  with(values: DependencyParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const r = (root as any).dependency;
    let model = new Dependency({ guid });

    if (r['@type'] !== undefined) {
      model = model.with({ type: r['@type'] });
    }
    if (r['@idref'] !== undefined) {
      model = model.with({ idref: r['@idref'] });
    }

    return model;
  }

  toPersistence() : Object {

    return {
      dependency: {
        '@idref': this.idref,
        '@type': this.type,
      },
    };
  }
}
