import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import * as types from './types';
import { Item } from './item';
import createGuid from '../../../utils/guid';

export type UnorderedParams = {
  items?: Immutable.OrderedMap<string, Item>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Unordered,
  elementType: 'unordered',
  items: Immutable.OrderedMap<string, Item>(),
  guid: '',
};

export class Unordered extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Unordered;
  elementType: 'unordered';
  items?: Immutable.OrderedMap<string, Item>;
  guid: string;

  constructor(params?: UnorderedParams) {
    super(augment(params));
  }

  with(values: UnorderedParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).unordered;
    let model = new Unordered({ guid });

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'item':
          model = model.with({ items: model.items.set(id, Item.fromPersistence(item, id)) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const s = {
      unordered: {
        '#array': this.items.toArray().map(s => s.toPersistence()),
      },
    };

    return s;
  }
}
