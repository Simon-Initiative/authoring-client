import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type PrefValueParams = {
  preference?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'PrefValue',
  elementType: 'prefvalue',
  preference: '',
  guid: '',
};

export class PrefValue extends Immutable.Record(defaultContent) {

  contentType: 'PrefValue';
  elementType: 'prefvalue';
  preference: string;
  guid: string;

  constructor(params?: PrefValueParams) {
    super(augment(params));
  }

  with(values: PrefValueParams) {
    return this.merge(values) as this;
  }

  clone() : PrefValue {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : PrefValue {

    const p = (root as any)['pref:value'];

    let model = new PrefValue({ guid });

    if (p['@preference'] !== undefined) {
      model = model.with({ preference: p['@preference'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      'pref:value': {
        '@preference': this.preference,
      },
    };
  }
}
