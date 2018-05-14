import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

import { CellData } from './celldata';
import { CellHeader } from './cellheader';

export type Cell = CellData | CellHeader;

export type RowParams = {
  cells?: Immutable.OrderedMap<string, Cell>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Row',
  elementType: 'row',
  cells: Immutable.OrderedMap<string, Cell>(),
  guid: '',
};

export class Row extends Immutable.Record(defaultContent) {

  contentType: 'Row';
  elementType: 'row';
  cells: Immutable.OrderedMap<string, Cell>;
  guid: string;

  constructor(params?: RowParams) {
    super(augment(params));
  }

  with(values: RowParams) {
    return this.merge(values) as this;
  }

  clone() : Row {
    return this.with({
      cells: this.cells.map(c => c.clone().with({ guid: createGuid() })).toOrderedMap(),
    });
  }


  static fromPersistence(root: Object, guid: string) : Row {

    const t = (root as any).tr;

    let model = new Row({ guid });

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'td':
          model = model.with({ cells: model.cells.set(id, CellData.fromPersistence(item, id)) });
          break;
        case 'th':
          model = model.with({ cells: model.cells.set(id, CellHeader.fromPersistence(item, id)) });
          break;
        default:

      }
    });


    return model;
  }

  toPersistence() : Object {
    return {
      tr: {
        '#array': this.cells.toArray().map(p => p.toPersistence()),
      },
    };
  }
}
