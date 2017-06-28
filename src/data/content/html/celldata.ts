import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { Row } from './row';
import { getKey } from '../../common';
import { Param } from './param';

import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');

import { toPersistence } from './topersistence';
import { toDraft } from './todraft';

export type CellDataParams = {
  align?: string,
  colspan?: string,
  rowspan?: string,
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'CellData',
  align: 'left',
  colspan: '1',
  rowspan: '1',
  content: emptyContent,
  guid: '',
};

export class CellData extends Immutable.Record(defaultContent) {
  
  contentType: 'CellData';
  align: string;
  colspan: string;
  rowspan: string;
  content: ContentState;
  guid: string;
  
  constructor(params?: CellDataParams) {
    super(augment(params));
  }

  with(values: CellDataParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : CellData {

    const t = (root as any).td;

    let model = new CellData({ guid });
    
    if (t['@colspan'] !== undefined) {
      model = model.with({ colspan: t['@colspan'] });
    }
    if (t['@rowspan'] !== undefined) {
      model = model.with({ rowspan: t['@rowspan'] });
    }
    if (t['@align'] !== undefined) {
      model = model.with({ align: t['@align'] });
    }

    if (t['#text'] !== undefined) {
      model = model.with({ content: toDraft(t) });
    } else {
      model = model.with({ content: toDraft(getChildren(t)) });
    }
    
    return model;
  }

  toPersistence() : Object {
    return {
      td: {
        '@colspan': this.colspan,
        '@rowspan': this.rowspan,
        '@align': this.align,
        '#array': toPersistence(this.content),
      },
    };
  }
}
