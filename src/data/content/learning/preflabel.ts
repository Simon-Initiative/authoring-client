import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type PrefLabelParams = {
  preference?: string,
  guid?: string;
};

const defaultContent = {
  contentType: 'PrefLabel',
  elementType: 'preflabel',
  preference: '',
  guid: '',
};

export class PrefLabel extends Immutable.Record(defaultContent) {

  contentType: 'PrefLabel';
  elementType: 'preflabel';
  preference: string;
  guid: string;

  constructor(params?: PrefLabelParams) {
    super(augment(params));
  }

  with(values: PrefLabelParams) {
    return this.merge(values) as this;
  }

  clone() : PrefLabel {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : PrefLabel {

    const p = (root as any)['pref:label'];

    let model = new PrefLabel({ guid });

    if (p['@preference'] !== undefined) {
      model = model.with({ preference: p['@preference'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      'pref:label': {
        '@preference': this.preference,
      },
    };
  }
}
