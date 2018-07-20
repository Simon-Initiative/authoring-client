import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';

import { Conjugate } from './conjugate';
import { CellHeader } from './cellheader';

export type ConjugationCell = Conjugate | CellHeader;

export type CrParams = {
  cells?: Immutable.OrderedMap<string, ConjugationCell>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Cr',
  cells: Immutable.OrderedMap<string, ConjugationCell>(),
  guid: '',
};

export class Cr extends Immutable.Record(defaultContent) {

  contentType: 'Cr';
  elementType: 'cr';
  cells: Immutable.OrderedMap<string, ConjugationCell>;
  guid: string;

  constructor(params?: CrParams) {
    super(augment(params));
  }

  with(values: CrParams) {
    return this.merge(values) as this;
  }

  clone(): Cr {
    return ensureIdGuidPresent(this.with({
      cells: this.cells.map(c => c.clone()).toOrderedMap(),
    }));
  }


  static fromPersistence(root: Object, guid: string, notify: () => void): Cr {

    const t = (root as any).cr;

    let model = new Cr({ guid });

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'conjugate':
          model = model.with({
            cells: model.cells.set(id, Conjugate.fromPersistence(item, id, notify)),
          });
          break;
        case 'th':
          model = model.with({
            cells: model.cells.set(id, CellHeader.fromPersistence(item, id, notify)),
          });
          break;
        default:

      }
    });


    return model;
  }

  toPersistence(): Object {
    return {
      cr: {
        '#array': this.cells.toArray().map(p => p.toPersistence()),
      },
    };
  }
}
