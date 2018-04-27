import * as Immutable from 'immutable';
import createGuid from '../../../../utils/guid';
import { augment, getChildren } from '../../common';
import { getKey } from '../../../common';
import { Initiator } from './initiator';

export type InitiatorGroupParams = {
  guid?: string;
  shuffle?: boolean;
  useInitiatorMaxWidth?: boolean;
  initiators?: Immutable.List<Initiator>;
};

const defaultContent = {
  contentType: 'InitiatorGroup',
  guid: '',
  shuffle: false,
  useInitiatorMaxWidth: false,
  initiators: Immutable.List<Initiator>(),
};

export class InitiatorGroup extends Immutable.Record(defaultContent) {

  contentType: 'InitiatorGroup';
  guid: string;
  shuffle: boolean;
  useInitiatorMaxWidth: boolean;
  initiators: Immutable.List<Initiator>;

  constructor(params?: InitiatorGroupParams) {
    super(augment(params));
  }

  with(values: InitiatorGroupParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : InitiatorGroup {

    const q = (json as any).initiatorGroup;
    let model = new InitiatorGroup({ guid });

    if (q['@shuffle'] !== undefined) {
      model = model.with({ shuffle: q['@shuffle'] });
    }
    if (q['@useInitiatorMaxWidth'] !== undefined) {
      model = model.with({ useInitiatorMaxWidth: q['@useInitiatorMaxWidth'] });
    }

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'initiator':
          model = model.with({ initiators:
            model.initiators.push(Initiator.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    return {
      initiatorGroup: {
        '@shuffle': this.shuffle,
        '@useInitiatorMaxWidth': this.useInitiatorMaxWidth,
        '#array': this.initiators.toArray().map(c => c.toPersistence()),
      },
    };
  }
}
