import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type SourceParams = {
  src?: string,
  type?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Source',
  elementType: 'source',
  src: '',
  type: '',
  guid: '',
};

export class Source extends Immutable.Record(defaultContent) {

  contentType: 'Source';
  elementType: 'source';
  src: string;
  type: string;
  guid: string;

  constructor(params?: SourceParams) {
    super(augment(params));
  }

  with(values: SourceParams) {
    return this.merge(values) as this;
  }

  clone() : Source {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Source {

    const t = (root as any).source;

    let model = new Source({ guid });

    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
    }
    if (t['@type'] !== undefined) {
      model = model.with({ type: t['@type'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      source: {
        '@src': this.src,
        '@type': this.type,
      },
    };
  }
}
