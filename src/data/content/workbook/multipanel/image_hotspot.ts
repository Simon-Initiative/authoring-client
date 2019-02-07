import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Hotspot } from './hotspot';
import createGuid from '../../../../utils/guid';
import { getChildren, setId, ensureIdGuidPresent } from '../../common';
import { getKey } from '../../../common';

export type HotspotVisibility = 'transparent' | 'visable';

export type ImageHotspotParams = {
  guid: string,
  id: Maybe<string>,
  src: string,
  alt: string,
  width: number,
  height: number,
  hotspotVisibility: HotspotVisibility,
  hotspots: Immutable.OrderedMap<string, Hotspot>,
};

const defaults = (params: Partial<ImageHotspotParams> = {}) => ({
  contentType: 'ImageHotspot',
  elementType: 'image_hotspot',
  guid: params.guid || createGuid(),
  id: params.id || createGuid(),
  src: params.src || 'NO_IMAGE_SELECTED',
  alt: params.alt || '',
  width: params.width || 600,
  height: params.height || 400,
  hotspotVisibility: params.hotspotVisibility || 'transparent',
  hotspots: params.hotspots || Immutable.OrderedMap<string, Hotspot>(),
});

export class ImageHotspot extends Immutable.Record(defaults()) {

  contentType: 'ImageHotspot';
  elementType: 'image_hotspot';
  guid: string;
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  hotspotVisibility: HotspotVisibility;
  hotspots: Immutable.OrderedMap<string, Hotspot>;

  constructor(params?: Partial<ImageHotspotParams>) {
    super(defaults(params));
  }

  clone(): ImageHotspot {
    return ensureIdGuidPresent(this.with({
      hotspots: this.hotspots.mapEntries(([_, v]) => {
        const clone: Hotspot = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Hotspot>,
    }));
  }

  with(values: Partial<ImageHotspotParams>) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void) : ImageHotspot {
    const q = (json as any).image_hotspot;
    let model = new ImageHotspot({ guid });

    model = setId(model, q, notify);

    if (q['@alt'] !== undefined) {
      model = model.with({ src: q['@alt'] });
    }
    if (q['@src'] !== undefined) {
      model = model.with({ src: q['@src'] });
    }
    if (q['@width'] !== undefined) {
      model = model.with({ width: +q['@width'] });
    }
    if (q['@height'] !== undefined) {
      model = model.with({ height: +q['@height'] });
    }
    if (q['@hotspots'] !== undefined) {
      model = model.with({
        hotspotVisibility: q['@hotspots'] === 'transparent' ? 'transparent' : 'visable',
      });
    }

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'hotspot':
          model = model.with({
            hotspots: model.hotspots.set(id, Hotspot.fromPersistence(item, id, notify)) });
          break;
        default:
      }
    });

    return model;

  }

  toPersistence() : Object {
    return {
      image_hotspot: {
        '@id': this.id,
        '@src': this.src,
        '@alt': this.alt,
        '@width': `${this.width}`,
        '@height': `${this.height}`,
        '@hotspots': this.hotspotVisibility,
        '#array': this.hotspots.toArray().map(c => c.toPersistence()),
      },
    };
  }
}
