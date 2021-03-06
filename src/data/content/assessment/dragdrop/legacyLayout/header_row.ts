import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { DndText } from './dnd_text';

export type HeaderRowParams = {
  guid?: string;
  cols?: Immutable.List<DndText>;
};

const defaultContent = {
  contentType: 'HeaderRow',
  elementType: 'headerRow',
  guid: '',
  cols: Immutable.List<DndText>(),
};

export class HeaderRow extends Immutable.Record(defaultContent) {

  contentType: 'HeaderRow';
  elementType: 'headerRow';
  guid: string;
  cols: Immutable.List<DndText>;

  constructor(params?: HeaderRowParams) {
    super(augment(params));
  }

  with(values: HeaderRowParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : HeaderRow {

    const q = (json as any).headerRow;
    let model = new HeaderRow({ guid });

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'text':
          model = model.with({ cols:
            model.cols.push(DndText.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    return {
      headerRow: {
        '#array': this.cols.toArray().map(c => c.toPersistence()),
      },
    };
  }
}
