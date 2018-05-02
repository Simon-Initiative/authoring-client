import * as Immutable from 'immutable';

import createGuid from '../../../../utils/guid';
import { augment, getChildren } from '../../common';
import { getKey } from '../../../common';
import { ContentRow } from './content_row';
import { HeaderRow } from './header_row';

export type TG_COL = ContentRow | HeaderRow;

export type TargetGroupParams = {
  guid?: string;
  rows?: Immutable.List<TG_COL>;
};

const defaultContent = {
  contentType: 'TargetGroup',
  guid: '',
  rows: Immutable.List<TG_COL>(),
};

export class TargetGroup extends Immutable.Record(defaultContent) {

  contentType: 'TargetGroup';
  guid: string;
  rows: Immutable.List<TG_COL>;

  constructor(params?: TargetGroupParams) {
    super(augment(params));
  }

  with(values: TargetGroupParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : TargetGroup {

    const q = (json as any).targetGroup;
    let model = new TargetGroup({ guid });

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'headerRow':
          model = model.with({ rows:
            model.rows.push(HeaderRow.fromPersistence(item, id)) });
          break;
        case 'contentRow':
          model = model.with({ rows:
            model.rows.push(ContentRow.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    return {
      targetGroup: {
        '#array': this.rows.toArray().map(c => c.toPersistence()),
      },
    };
  }
}
