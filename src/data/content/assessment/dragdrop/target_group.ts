import * as Immutable from 'immutable';

import createGuid from '../../../../utils/guid';
import { augment, getChildren } from '../../common';
import { getKey } from '../../../common';
import { ContentRow } from './content_row';
import { HeaderRow } from './header_row';

export type TG_ROW = ContentRow | HeaderRow;

export type TargetGroupParams = {
  guid?: string;
  rows?: Immutable.List<TG_ROW>;
};

const defaultContent = {
  contentType: 'TargetGroup',
  elementType: 'targetGroup',
  guid: '',
  rows: Immutable.List<TG_ROW>(),
};

export class TargetGroup extends Immutable.Record(defaultContent) {

  contentType: 'TargetGroup';
  elementType: 'targetGroup';
  guid: string;
  rows: Immutable.List<TG_ROW>;

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
