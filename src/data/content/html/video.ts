import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
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
  popout?: Immutable.OrderedMap<string, Popout>,
  alternate?: Immutable.OrderedMap<string, Alternate>,
  titleContent?: Immutable.OrderedMap<string, Title>,
  caption?: Immutable.OrderedMap<string, Caption>,
  cite?: Immutable.OrderedMap<string, Cite>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Video',
  id: '',
  title: '',
  src: '',
  type: 'Video/mpeg',
  controls: true,
  href: '',
  poster: '',
  width: '500',
  height: '300',
  sources: Immutable.OrderedMap<string, Source>(),
  tracks: Immutable.OrderedMap<string, Track>(),
  popout: Immutable.OrderedMap<string, Popout>(),
  alternate: Immutable.OrderedMap<string, Alternate>(),
  titleContent: Immutable.OrderedMap<string, Title>(),
  caption: Immutable.OrderedMap<string, Caption>(),
  cite: Immutable.OrderedMap<string, Cite>(),
  guid: '',
};

export class Video extends Immutable.Record(defaultContent) {
  
  contentType: 'Video';
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
  popout: Immutable.OrderedMap<string, Popout>;
  alternate: Immutable.OrderedMap<string, Alternate>;
  titleContent: Immutable.OrderedMap<string, Title>;
  caption: Immutable.OrderedMap<string, Caption>;
  cite: Immutable.OrderedMap<string, Cite>;
  guid: string;
  
  constructor(params?: VideoParams) {
    super(augment(params));
  }

  with(values: VideoParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Video {

    const t = (root as any).video;

    let model = new Video({ guid });
    
    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    }
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
          model = model.with({ sources: model.sources.set(id, Source.fromPersistence(item, id)) });
          break;
        case 'track':
          model = model.with({ tracks: model.tracks.set(id, Track.fromPersistence(item, id)) });
          break;
        case 'popout':
          model = model.with({ popout: model.popout.set(id, Popout.fromPersistence(item, id)) });
          break;
        case 'alternate':
          model = model.with(
            { alternate: model.alternate.set(id, Alternate.fromPersistence(item, id)) });
          break;
        case 'title':
          model = model.with(
            { titleContent: model.titleContent.set(id, Title.fromPersistence(item, id)) });
          break;
        case 'caption':
          model = model.with({ caption: model.caption.set(id, Caption.fromPersistence(item, id)) });
          break;
        case 'cite':
          model = model.with({ cite: model.cite.set(id, Cite.fromPersistence(item, id)) });
          break;
        default:
          
      }
    });
    
    return model;
  }

  toPersistence() : Object {

    const children = [
      ...this.titleContent.toArray().map(p => p.toPersistence()),
      ...this.caption.toArray().map(p => p.toPersistence()),
      ...this.cite.toArray().map(p => p.toPersistence()),
      ...this.popout.toArray().map(p => p.toPersistence()),
      ...this.alternate.toArray().map(p => p.toPersistence()),
      ...this.sources.toArray().map(p => p.toPersistence()),
      ...this.tracks.toArray().map(p => p.toPersistence()),
    ];

    return {
      video: {
        '@id': this.id,
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
