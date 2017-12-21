import * as Immutable from 'immutable';
import { augment } from '../common';

export type PrefLabelParams = {
  preference?: string,
  guid?: string;
};

const defaultContent = {
  contentType: 'PrefLabel',
  preference: '',
  guid: '',
};

export class PrefLabel extends Immutable.Record(defaultContent) {
  
  contentType: 'PrefLabel';
  preference: string;
  guid: string;
  
  constructor(params?: PrefLabelParams) {
    super(augment(params));
  }

  with(values: PrefLabelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : PrefLabel {

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
