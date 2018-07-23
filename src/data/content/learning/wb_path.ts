import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type WbPathParams = {
  href?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'WbPath',
  href: '',
  guid: '',
};

export class WbPath extends Immutable.Record(defaultContent) {

  contentType: 'WbPath';
  href: string;
  guid: string;

  constructor(params?: WbPathParams) {
    super(augment(params));
  }

  with(values: WbPathParams) {
    return this.merge(values) as this;
  }

  clone() : WbPath {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : WbPath {

    const p = (root as any)['wb:path'];

    let model = new WbPath({ guid });

    if (p['@href'] !== undefined) {
      model = model.with({ href: p['@href'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      'wb:path': {
        '@href': this.href,
      },
    };
  }
}
