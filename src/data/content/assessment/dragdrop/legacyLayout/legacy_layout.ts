import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { TargetGroup } from './target_group';
import { InitiatorGroup } from './initiator_group';

export type LegacyLayoutParams = {
  guid?: string;
  targetGroup?: TargetGroup;
  initiatorGroup?: InitiatorGroup;
};

const defaultContent = {
  contentType: 'LegacyLayout',
  elementType: 'legacylayout',
  guid: '',
  targetGroup: new TargetGroup(),
  initiatorGroup: new InitiatorGroup(),
};

export class LegacyLayout extends Immutable.Record(defaultContent) {

  contentType: 'LegacyLayout';
  elementType: 'legacylayout';
  guid: string;
  targetGroup: TargetGroup;
  initiatorGroup: InitiatorGroup;

  constructor(params?: LegacyLayoutParams) {
    super(augment(params));
  }

  with(values: LegacyLayoutParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : LegacyLayout {

    const q = (json as any).dragdrop;
    let model = new LegacyLayout({ guid });

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
