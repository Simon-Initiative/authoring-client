import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { Row } from './row';
import { getKey } from '../../common';
import { Param } from './param';

export type TableParams = {
  id?: string,
  summary?: string,
  rowstyle?: string,
  rows?: Immutable.OrderedMap<string, Row>,
  guid?: string,
};

const defaultContent = {
  id: createGuid(),
  contentType: 'Table',
  summary: '',
  rowstyle: 'plain',
  rows: Immutable.OrderedMap<string, Row>(),
  guid: '',
};

export class Table extends Immutable.Record(defaultContent) {
  id: string;
  contentType: 'Table';
  rowstyle: string;
  summary: string;
  rows: Immutable.OrderedMap<string, Row>;
  guid: string;
  
  constructor(params?: TableParams) {
    super(augment(params));
  }

  with(values: TableParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Table {

    const t = (root as any).table;

    let model = new Table({ guid });
    
    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    }
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
          model = model.with({ rows: model.rows.set(id, Row.fromPersistence(item, id)) });
          break;
        default:
          
      }
    });
    
    
    return model;
  }

  toPersistence() : Object {
    return {
      table: {
        '@id': this.id,
        '@summary': this.summary,
        '@rowstyle': this.rowstyle,
        '#array': this.rows.toArray().map(p => p.toPersistence()),
      }, 
    };
  }
}
