import * as Immutable from 'immutable';
import { augment } from '../common';

import * as types from './types';

export type PreconditionParams = {
  condition?: types.ConditionTypes,
  idref?: string,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Precondition,
  elementType: 'precondition',
  condition: types.ConditionTypes.None,
  idref: '',
  guid: '',
};

export class Precondition extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Precondition;
  elementType: 'precondition';
  condition: types.ConditionTypes;
  idref: string;
  guid: string;

  constructor(params?: PreconditionParams) {
    super(augment(params));
  }

  with(values: PreconditionParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const r = (root as any).precondition;
    let model = new Precondition({ guid });

    if (r['@condition'] !== undefined) {
      model = model.with({ condition: r['@condition'] });
    }
    if (r['@idref'] !== undefined) {
      model = model.with({ idref: r['@idref'] });
    }

    return model;
  }

  toPersistence() : Object {

    return {
      precondition: {
        '@idref': this.idref,
        '@condition': this.condition,
      },
    };
  }
}
