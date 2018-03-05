import * as Immutable from 'immutable';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { augment } from '../common';
import createGuid from 'utils/guid';

export type CellDataParams = {
  align?: string,
  colspan?: string,
  rowspan?: string,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'CellData',
  align: 'left',
  colspan: '1',
  rowspan: '1',
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class CellData extends Immutable.Record(defaultContent) {

  contentType: 'CellData';
  align: string;
  colspan: string;
  rowspan: string;
  content: ContentElements;
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

    model = model.with({ content: ContentElements
      .fromPersistence(t, createGuid(), INLINE_ELEMENTS) });

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
