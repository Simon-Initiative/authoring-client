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
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
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
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: new Title(),
  caption: new Caption(),
  cite: new Cite(),
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
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  guid: string;
  
  constructor(params?: AudioParams) {
    super(augment(params));
  }

  with(values: AudioParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, toDraft) : Audio {

    const t = (root as any).audio;

    let model = new Audio({ guid });
    
    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
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
          model = model.with({ popout: Popout.fromPersistence(item, id) });
          break;
        case 'alternate':
          model = model.with(
            { alternate: Alternate.fromPersistence(item, id) });
          break;
        case 'title':
          model = model.with(
            { titleContent: Title.fromPersistence(item, id) });
          break;
        case 'caption':
          model = model.with({ caption: Caption.fromPersistence(item, id) });
          break;
        case 'cite':
          model = model.with({ cite: Cite.fromPersistence(item, id, toDraft) });
          break;
        default:
          
      }
    });

    // Adjust the model to move the contents of the 'src' attribute 
    // into a 'source' element. This allows us to access legacy audio elements data
    // through the proper channel. 
    if (model.src !== '' && model.sources.size === 0) {
      const source = new Source({ src: model.src });
      const sources = model.sources.set(source.guid, source);
      model = model.with({ sources });
    }
    
    return model;
  }

  toPersistence(toPersistence) : Object {

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
