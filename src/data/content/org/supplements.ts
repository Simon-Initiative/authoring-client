import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Supplement } from './supplement';
import { SupplementGroup } from './supplement_group';
import createGuid from '../../../utils/guid';
import * as types from './types';


export type SupplementsParams = {
  children?: Immutable.OrderedMap<string, Supplement | SupplementGroup>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Supplements,
  elementType: 'supplements',
  children: Immutable.OrderedMap<string, Supplement | SupplementGroup>(),
  guid: '',
};

export class Supplements extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Supplements;
  elementType: 'supplements';
  children?: Immutable.OrderedMap<string, Supplement | SupplementGroup>;
  guid: string;

  constructor(params?: SupplementsParams) {
    super(augment(params));
  }

  with(values: SupplementsParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).supplements;
    let model = new Supplements({ guid });

    getChildren(s).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'supplement':
          model = model.with(
            { children: model.children.set(id, Supplement.fromPersistence(item, id)) });
          break;
        case 'supplement_group':
          model = model.with(
            { children: model.children.set(id, SupplementGroup.fromPersistence(item, id)) });
          break;

        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    return  {
      supplements: {
        '#array': this.children.toArray().map(s => s.toPersistence()),
      },
    };
  }
}
