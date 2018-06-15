import * as Immutable from 'immutable';
import { augment } from '../../common';

export type HotspotParams = {
  guid?: string,
  value?: string,
  shape?: string,
  coords?: Immutable.List<number>,
};

const defaultContent = {
  contentType: 'Hotspot',
  elementType: 'hotspot',
  guid: '',
  value: '',
  shape: '',
  coords: Immutable.List<number>(),
};

export class Hotspot extends Immutable.Record(defaultContent) {

  contentType: 'Hotspot';
  elementType: 'hotspot';
  guid: string;
  value: string;
  shape: string;
  coords: Immutable.List<number>;

  constructor(params?: HotspotParams) {
    super(augment(params));
  }

  with(values: HotspotParams) {
    return this.merge(values) as this;
  }

  clone(): Hotspot {
    return this;
  }

  static fromPersistence(json: Object, guid: string): Hotspot {
    const q = (json as any).hotspot;
    let model = new Hotspot({ guid });

    if (q['@value'] !== undefined) {
      model = model.with({ value: q['@value'] });
    }
    if (q['@shape'] !== undefined) {
      model = model.with({ shape: q['@shape'] });
    }
    if (q['@coords'] !== undefined) {
      model = model.with({
        coords: Immutable.List<number>(q['@coords'].split(',').map(val => +val)) });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      hotspot: {
        '@value': this.value,
        '@shape': this.shape,
        '@coords': this.coords.map(val => `${val}`).join(','),
      },
    };
  }
}
