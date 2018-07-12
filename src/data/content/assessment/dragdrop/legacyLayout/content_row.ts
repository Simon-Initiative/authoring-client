import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { DndText } from './dnd_text';
import { Target } from './target';

export type ContentRowParams = {
  guid?: string;
  cols?: Immutable.List<DndText | Target>;
};

const defaultContent = {
  contentType: 'ContentRow',
  elementType: 'contentRow',
  guid: '',
  cols: Immutable.List<DndText | Target>(),
};

export class ContentRow extends Immutable.Record(defaultContent) {

  contentType: 'ContentRow';
  elementType: 'contentRow';
  guid: string;
  cols: Immutable.List<DndText | Target>;

  constructor(params?: ContentRowParams) {
    super(augment(params));
  }

  with(values: ContentRowParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : ContentRow {

    const q = (json as any).contentRow;
    let model = new ContentRow({ guid });

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'target':
          model = model.with({ cols:
            model.cols.push(Target.fromPersistence(item, id)) });
          break;
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
      contentRow: {
        '#array': this.cols.toArray().map(c => c.toPersistence()),
      },
    };
  }
}
