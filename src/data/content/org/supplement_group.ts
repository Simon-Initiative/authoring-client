import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import * as types from './types';
import { Supplement } from './supplement';
import createGuid from '../../../utils/guid';

export type SupplementGroupParams = {
  title?: string,
  description?: string,
  supplements?: Immutable.OrderedMap<string, Supplement>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.SupplementGroup,
  elementType: 'supplement_group',
  title: '',
  description: '',
  supplements: Immutable.OrderedMap<string, Supplement>(),
  guid: '',
};

export class SupplementGroup extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.SupplementGroup;
  elementType: 'supplement_group';
  title: string;
  description: string;
  supplements?: Immutable.OrderedMap<string, Supplement>;
  guid: string;

  constructor(params?: SupplementGroupParams) {
    super(augment(params));
  }

  with(values: SupplementGroupParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).supplement_group;
    let model = new SupplementGroup({ guid });

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with(
            { title: (item as any).title['#text'] });
          break;
        case 'description':
          model = model.with(
            { description: (item as any).description['#text'] });
          break;
        case 'before':
          model = model.with(
            { supplements: model.supplements.set(id, Supplement.fromPersistence(item, id)) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = [
      { title: { '#text': this.title } },
      { description: { '#text': this.description } },
      ...this.supplements.toArray().map(s => s.toPersistence()),
    ];

    return {
      supplement_group: {
        '#array': children,
      },
    };

  }
}
