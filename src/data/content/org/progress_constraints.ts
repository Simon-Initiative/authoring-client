import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import * as types from './types';
import { ProgressConstraint } from './progress_constraint';
import createGuid from '../../../utils/guid';

export type ProgressConstraintsParams = {
  progressConstraints?: Immutable.OrderedMap<string, ProgressConstraint>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.ProgressConstraints,
  elementType: 'progress_constraints',
  progressConstraints: Immutable.OrderedMap<string, ProgressConstraint>(),
  guid: '',
};

export class ProgressConstraints extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.ProgressConstraints;
  elementType: 'progress_constraint';
  progressConstraints?: Immutable.OrderedMap<string, ProgressConstraint>;
  guid: string;

  constructor(params?: ProgressConstraintsParams) {
    super(augment(params));
  }

  with(values: ProgressConstraintsParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).progress_constraints;
    let model = new ProgressConstraints({ guid });

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'progress_constraint':
          model = model.with(
            { progressConstraints: model.progressConstraints.set(
              id, ProgressConstraint.fromPersistence(item, id)) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const s = {
      progress_constraints: {
        '#array': this.progressConstraints.toArray().map(s => s.toPersistence()),
      },
    };

    return s;
  }
}
