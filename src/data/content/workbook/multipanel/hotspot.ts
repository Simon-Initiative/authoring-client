import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, ensureIdGuidPresent } from '../../common';

export type HotspotParams = {
  guid?: string,
  shape?: string,
  coords?: Immutable.List<number>,
  title?: Maybe<string>,
  panelRef?: string,
  activityRef?: string,
};

const defaultContent = {
  contentType: 'Hotspot',
  elementType: 'hotspot',
  guid: '',
  shape: '',
  coords: Immutable.List<number>(),
  title: Maybe.nothing(),
  panelRef: '',
  activityRef: '',
};

export class Hotspot extends Immutable.Record(defaultContent) {

  contentType: 'Hotspot';
  elementType: 'hotspot';
  guid: string;
  shape: string;
  coords: Immutable.List<number>;
  title: Maybe<string>;
  panelRef: string;
  activityRef: string;

  constructor(params?: HotspotParams) {
    super(augment(params));
  }

  with(values: HotspotParams) {
    return this.merge(values) as this;
  }

  clone(): Hotspot {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(json: Object, guid: string, notify: () => void): Hotspot {
    const q = (json as any).hotspot;
    let model = new Hotspot({ guid });

    if (q['@shape'] !== undefined) {
      model = model.with({ shape: q['@shape'] });
    }
    if (q['@coords'] !== undefined) {
      model = model.with({
        coords: Immutable.List<number>(q['@coords'].split(',').map(val => +val)) });
    }
    if (q['@title'] !== undefined) {
      model = model.with({ title: Maybe.maybe(q['@title']) });
    }
    if (q['@panel_ref'] !== undefined) {
      model = model.with({ panelRef: q['@panel_ref'] });
    }
    if (q['@activity_ref'] !== undefined) {
      model = model.with({ activityRef: q['@activity_ref'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      hotspot: {
        '@shape': this.shape,
        '@coords': this.coords.map(val => `${val}`).join(','),
        ...(this.title.caseOf({
          just: title => ({ '@title': title }),
          nothing: () => ({}),
        })),
        '@panel_ref': this.panelRef,
        '@activity_ref': this.activityRef,
      },
    };
  }
}
