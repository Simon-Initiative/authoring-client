import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
import { getKey } from '../../common';

import { Source } from './source';
import { Track } from './track';
import { Popout } from './popout';
import { Alternate } from './alternate';
import { Title } from './title';
import { Caption } from './caption';
import { Cite } from './cite';

export type VideoParams = {
  id?: string,
  title?: string,
  src?: string,
  type?: string,
  controls?: boolean,
  href?: string,
  poster?: string,
  width?: string,
  height?: string,
  sources?: Immutable.OrderedMap<string, Source>,
  tracks?: Immutable.OrderedMap<string, Track>,
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  guid?: string,
};

const defaultContent = {
  contentType: 'Video',
  elementType: 'video',
  id: '',
  title: '',
  src: '',
  type: '',
  controls: true,
  href: '',
  poster: '',
  width: '500',
  height: '300',
  sources: Immutable.OrderedMap<string, Source>(),
  tracks: Immutable.OrderedMap<string, Track>(),
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: new Title(),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class Video extends Immutable.Record(defaultContent) {

  contentType: 'Video';
  elementType: 'video';
  id: string;
  title: string;
  src: string;
  type: string;
  controls: boolean;
  href: string;
  poster: string;
  width: string;
  height: string;
  sources: Immutable.OrderedMap<string, Source>;
  tracks: Immutable.OrderedMap<string, Track>;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  guid: string;

  constructor(params?: VideoParams) {
    super(augment(params, true));
  }

  with(values: VideoParams) {
    return this.merge(values) as this;
  }

  clone(): Video {
    return ensureIdGuidPresent(this.with({
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
      popout: this.popout.clone(),
      sources: this.sources.mapEntries(([_, v]) => {
        const clone: Source = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Source>,
      tracks: this.tracks.mapEntries(([_, v]) => {
        const clone: Track = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Track>,
    }));
  }


  static fromPersistence(root: Object, guid: string, notify: () => void): Video {

    const t = (root as any).video;

    let model = new Video({ guid });

    model = setId(model, t, notify);

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
    }
    if (t['@type'] !== undefined) {
      model = model.with({ type: t['@type'] });
    }
    if (t['@href'] !== undefined) {
      model = model.with({ href: t['@href'] });
    }
    if (t['@poster'] !== undefined) {
      model = model.with({ poster: t['@poster'] });
    }
    if (t['@height'] !== undefined) {
      model = model.with({ height: t['@height'] });
    }
    if (t['@width'] !== undefined) {
      model = model.with({ width: t['@width'] });
    }
    if (t['@controls'] !== undefined) {
      model = model.with({ controls: t['@controls'] === 'true' });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'source':
          model = model.with({
            sources: model.sources.set(id, Source.fromPersistence(item, id, notify)),
          });
          break;
        case 'track':
          model = model.with({
            tracks: model.tracks.set(id, Track.fromPersistence(item, id, notify)),
          });
          break;
        case 'popout':
          model = model.with({ popout: Popout.fromPersistence(item, id, notify) });
          break;
        case 'alternate':
          model = model.with(
            { alternate: Alternate.fromPersistence(item, id, notify) });
          break;
        case 'title':
          model = model.with(
            { titleContent: Title.fromPersistence(item, id, notify) });
          break;
        case 'caption':
          model = model.with({ caption: Caption.fromPersistence(item, id, notify) });
          break;
        case 'cite':
          model = model.with({ cite: Cite.fromPersistence(item, id, notify) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    let sources = this.sources.toArray();
    if (sources.length === 0
      && this.tracks.size > 0) {
      sources = [new Source().with({ src: this.tracks.toArray()[0].src })];
    }

    const children = [
      this.titleContent.toPersistence(),
      // this.cite.toPersistence(toPersistence),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
      ...sources.map(p => p.toPersistence()),
      ...this.tracks.toArray().map(p => p.toPersistence()),
    ];

    return {
      video: {
        '@id': this.id ? this.id : createGuid(),
        '@title': this.title,
        '@src': this.src,
        '@type': this.type,
        '@href': this.href,
        '@poster': this.poster,
        '@height': this.height,
        '@width': this.width,
        '@controls': this.controls ? 'true' : 'false',
        '#array': children,
      },
    };
  }
}
