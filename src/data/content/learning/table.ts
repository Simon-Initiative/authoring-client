import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, setId } from '../common';
import { Row } from './row';
import { CellData } from './celldata';
import { getKey } from '../../common';
import { Title } from './title';
import { Caption } from './caption';
import { Cite } from './cite';


export type TableParams = {
  id?: string,
  summary?: string,
  rowstyle?: string,
  title?: Title,
  caption?: Caption,
  cite?: Cite,
  rows?: Immutable.OrderedMap<string, Row>,
  guid?: string,
};

const defaultContent = {
  id: '',
  contentType: 'Table',
  elementType: 'table',
  summary: '',
  title: new Title(),
  caption: new Caption(),
  cite: new Cite(),
  rowstyle: 'plain',
  rows: Immutable.OrderedMap<string, Row>(),
  guid: '',
};


function createDefaultRows() {
  const cell = new CellData().with({ guid: createGuid() });
  const cells = Immutable.OrderedMap<string, CellData>().set(cell.guid, cell);
  const row = new Row().with({ cells, guid: createGuid() });
  return Immutable.OrderedMap<string, Row>().set(row.guid, row);
}


export class Table extends Immutable.Record(defaultContent) {
  id: string;
  contentType: 'Table';
  elementType: 'table';
  rowstyle: string;
  summary: string;
  title: Title;
  caption: Caption;
  cite: Cite;
  rows: Immutable.OrderedMap<string, Row>;
  guid: string;

  constructor(params?: TableParams) {
    super(augment(params, true));
  }

  with(values: TableParams) {
    return this.merge(values) as this;
  }

  clone() : Table {
    return this.with({
      title: this.title.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
      rows: this.rows.mapEntries(([_, v]) => {
        const clone: Row = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Row>,
    });
  }


  static fromPersistence(root: Object, guid: string, notify: () => void) : Table {

    const t = (root as any).table;

    let model = new Table({ guid });

    model = setId(model, t, notify);

    if (t['@summary'] !== undefined) {
      model = model.with({ summary: t['@summary'] });
    }
    if (t['@rowstyle'] !== undefined) {
      model = model.with({ rowstyle: t['@rowstyle'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'tr':
          model = model.with({ rows: model.rows.set(id, Row.fromPersistence(item, id, notify)) });
          break;
        case 'title':
          model = model.with(
            { title: Title.fromPersistence(item, id, notify) });
          break;
        case 'caption':
          model = model.with({ caption: Caption.fromPersistence(item, id, notify) });
          break;
        case 'cite':
          model = model.with({ cite: Cite.fromPersistence(item, id, notify) });
          break;
        default:

      }
    });


    return model;
  }

  toPersistence() : Object {

    const rows = this.rows.size === 0
      ? createDefaultRows().toArray().map(p => p.toPersistence())
      : this.rows.toArray().map(p => p.toPersistence());

    const children = [
      this.title.toPersistence(),
      this.cite.toPersistence(),
      this.caption.toPersistence(),
      ...rows,
    ];

    return {
      table: {
        '@id': this.id ? this.id : createGuid(),
        '@summary': this.summary,
        '@rowstyle': this.rowstyle,
        '#array': children,
      },
    };
  }
}
