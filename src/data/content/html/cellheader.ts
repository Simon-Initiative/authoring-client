import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { Row } from './row';
import { getKey } from '../../common';

import { ContentState } from 'draft-js';
import { cloneContent } from '../common/clone';
const emptyContent = ContentState.createFromText('');

import { toPersistence } from './topersistence';
import { toDraft } from './todraft';

export type CellHeaderParams = {
  align?: string,
  colspan?: string,
  rowspan?: string,
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'CellHeader',
  align: 'left',
  colspan: '1',
  rowspan: '1',
  content: emptyContent,
  guid: '',
};

export class CellHeader extends Immutable.Record(defaultContent) {

  contentType: 'CellHeader';
  align: string;
  colspan: string;
  rowspan: string;
  content: ContentState;
  guid: string;

  constructor(params?: CellHeaderParams) {
    super(augment(params));
  }

  with(values: CellHeaderParams) {
    return this.merge(values) as this;
  }


  clone() : CellHeader {
    return this.with({
      content: cloneContent(this.content),
    });
  }

  static fromPersistence(root: Object, guid: string) : CellHeader {

    const t = (root as any).th;

    let model = new CellHeader({ guid });

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
      th: {
        '@colspan': this.colspan,
        '@rowspan': this.rowspan,
        '@align': this.align,
        '#array': toPersistence(this.content, true),
      },
    };
  }
}
