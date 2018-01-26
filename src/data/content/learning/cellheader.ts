import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { InlineContent } from '../types/inline';

export type CellHeaderParams = {
  align?: string,
  colspan?: string,
  rowspan?: string,
  content?: InlineContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'CellHeader',
  align: 'left',
  colspan: '1',
  rowspan: '1',
  content: new InlineContent(),
  guid: '',
};

export class CellHeader extends Immutable.Record(defaultContent) {

  contentType: 'CellHeader';
  align: string;
  colspan: string;
  rowspan: string;
  content: InlineContent;
  guid: string;

  constructor(params?: CellHeaderParams) {
    super(augment(params));
  }

  with(values: CellHeaderParams) {
    return this.merge(values) as this;
  }


  clone() : CellHeader {
    return this.with({
      content: this.content.clone(),
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
      model = model.with({ content: InlineContent.fromPersistence(t, '') });
    } else {
      model = model.with({ content: InlineContent.fromPersistence(getChildren(t), '') });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      th: {
        '@colspan': this.colspan,
        '@rowspan': this.rowspan,
        '@align': this.align,
        '#array': this.content.toPersistence(),
      },
    };
  }
}
