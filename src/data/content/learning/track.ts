import * as Immutable from 'immutable';
import { augment } from '../common';

export type TrackParams = {
  src?: string,
  kind?: string,
  label?: string,
  srclang?: string,
  default?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Track',
  elementType: 'track',
  src: '',
  kind: '',
  label: '',
  srclang: '',
  default: '',
  guid: '',
};

export class Track extends Immutable.Record(defaultContent) {

  contentType: 'Track';
  elementType: 'track';
  src: string;
  kind: string;
  label: string;
  srclang: string;
  default: string;
  guid: string;

  constructor(params?: TrackParams) {
    super(augment(params));
  }

  with(values: TrackParams) {
    return this.merge(values) as this;
  }

  clone() : Track {
    return this;
  }

  static fromPersistence(root: Object, guid: string) : Track {

    const t = (root as any).track;

    let model = new Track({ guid });

    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
    }
    if (t['@kind'] !== undefined) {
      model = model.with({ kind: t['@kind'] });
    }
    if (t['@label'] !== undefined) {
      model = model.with({ label: t['@label'] });
    }
    if (t['@srclang'] !== undefined) {
      model = model.with({ srclang: t['@srclang'] });
    }
    if (t['@default'] !== undefined) {
      model = model.with({ default: t['@default'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      track: {
        '@src': this.src,
        '@kind': this.kind,
        '@label': this.label,
        '@srclang': this.srclang,
        '@default': this.default,
      },
    };
  }
}
