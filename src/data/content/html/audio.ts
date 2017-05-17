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

export type AudioParams = {
  id?: string,
  title?: string,
  src?: string,
  type?: string,
  controls?: boolean,
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
  contentType: 'Audio',
  id: '',
  title: '',
  src: '',
  type: 'audio/mpeg',
  controls: true,
  sources: Immutable.OrderedMap<string, Source>(),
  tracks: Immutable.OrderedMap<string, Track>(),
  popout: Immutable.OrderedMap<string, Popout>(),
  alternate: Immutable.OrderedMap<string, Alternate>(),
  titleContent: Immutable.OrderedMap<string, Title>(),
  caption: Immutable.OrderedMap<string, Caption>(),
  cite: Immutable.OrderedMap<string, Cite>(),
  guid: '',
};

export class Audio extends Immutable.Record(defaultContent) {
  
  contentType: 'Audio';
  id: string;
  title: string;
  src: string;
  type: string;
  controls: boolean;
  sources: Immutable.OrderedMap<string, Source>;
  tracks: Immutable.OrderedMap<string, Track>;
  popout: Immutable.OrderedMap<string, Popout>;
  alternate: Immutable.OrderedMap<string, Alternate>;
  titleContent: Immutable.OrderedMap<string, Title>;
  caption: Immutable.OrderedMap<string, Caption>;
  cite: Immutable.OrderedMap<string, Cite>;
  guid: string;
  
  constructor(params?: AudioParams) {
    super(augment(params));
  }

  with(values: AudioParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Audio {

    const t = (root as any).audio;

    let model = new Audio({ guid });
    
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
      audio: {
        '@id': this.id,
        '@title': this.title,
        '@src': this.src,
        '@type': this.type,
        '@controls': this.controls ? 'true' : 'false',
        '#array': children,
      }, 
    };
  }
}
