import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import * as types from './types';

export type ProgressConstraintParams = {
  condition?: types.ConditionTypes,
  grainSize?: types.GrainSizes,
  id?: string,
  text?: string,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.ProgressConstraint,
  condition: types.ConditionTypes.None,
  grainSize: types.GrainSizes.Item,
  id: '',
  text: '',
  guid: '',
};

export class ProgressConstraint extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.ProgressConstraint;
  condition: types.ConditionTypes;
  grainSize: types.GrainSizes;
  id: string;
  text: string;
  guid: string;

  constructor(params?: ProgressConstraintParams) {
    super(augment(params));
  }

  with(values: ProgressConstraintParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const r = (root as any).progress_constraint;
    let model = new ProgressConstraint({ guid });

    if (r['@condition'] !== undefined) {
      model = model.with({ condition: r['@condition'] });
    }
    if (r['@id'] !== undefined) {
      model = model.with({ id: r['@id'] });
    }
    if (r['@grain_size'] !== undefined) {
      model = model.with({ grainSize: r['@grain_size'] });
    }

    getChildren(r).forEach((item) => {

      const key = getKey(item);

      switch (key) {
        case '#text':
          model = model.with({ text: item['#text'] });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    return {
      progress_constraint: {
        '@id': this.id,
        '@condition': this.condition,
        '@grain_size': this.grainSize,
        '#array': [{ '#text': this.text }],
      },
    };
  }
}
