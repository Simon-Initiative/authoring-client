import * as Immutable from 'immutable';

import createGuid from '../../../../utils/guid';
import { augment, getChildren } from '../../common';
import { getKey } from '../../../common';
import { TargetGroup } from './target_group';
import { InitiatorGroup } from './initiator_group';

export type DndLayoutParams = {
  guid?: string;
  targetGroup?: TargetGroup;
  initiatorGroup?: InitiatorGroup;
};

const defaultContent = {
  contentType: 'DndLayout',
  elementType: 'dragdrop',
  guid: '',
  targetGroup: new TargetGroup(),
  initiatorGroup: new InitiatorGroup(),
};

export class DndLayout extends Immutable.Record(defaultContent) {

  contentType: 'DndLayout';
  elementType: 'dragdrop';
  guid: string;
  targetGroup: TargetGroup;
  initiatorGroup: InitiatorGroup;

  constructor(params?: DndLayoutParams) {
    super(augment(params));
  }

  with(values: DndLayoutParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : DndLayout {

    const q = (json as any).dragdrop;
    let model = new DndLayout({ guid });

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'targetGroup':
          model = model.with({ targetGroup: TargetGroup.fromPersistence(item, id) });
          break;
        case 'initiatorGroup':
          model = model.with({
            initiatorGroup: InitiatorGroup.fromPersistence(item, id) });
          break;
        default:
      }
    });

    return model;

  }

  toPersistence() : Object {
    return {
      dragdrop: {
        '#array': [
          this.targetGroup.toPersistence(),
          this.initiatorGroup.toPersistence(),
        ],
      },
    };
  }
}
