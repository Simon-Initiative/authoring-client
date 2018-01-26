import * as Immutable from 'immutable';
import { InlineContent } from '../common/inline';
import { augment, getChildren } from '../common';
import createGuid from 'utils/guid';

export type CellDataParams = {
  align?: string,
  colspan?: string,
  rowspan?: string,
  content?: InlineContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'CellData',
  align: 'left',
  colspan: '1',
  rowspan: '1',
  content: new InlineContent(),
  guid: '',
};

export class CellData extends Immutable.Record(defaultContent) {

  contentType: 'CellData';
  align: string;
  colspan: string;
  rowspan: string;
  content: InlineContent;
  guid: string;

  constructor(params?: CellDataParams) {
    super(augment(params));
  }

  with(values: CellDataParams) {
    return this.merge(values) as this;
  }

  clone() : CellData {
    return this.with({
      content: this.content.clone(),
    });
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

    model = model.with({ content: InlineContent.fromPersistence(t, createGuid()) });

    return model;
  }

  toPersistence() : Object {
    return {
      td: {
        '@colspan': this.colspan,
        '@rowspan': this.rowspan,
        '@align': this.align,
        '#array': this.content.toPersistence(),
      },
    };
  }
}
