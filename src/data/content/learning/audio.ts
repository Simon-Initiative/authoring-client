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
  elementType: 'audio',
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
  elementType: 'audio';
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
    super(augment(params, true));
  }

  with(values: AudioParams) {
    return this.merge(values) as this;
  }

  clone(): Audio {
    return ensureIdGuidPresent(this.with({
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
      sources: this.sources.map(s => s.clone()).toOrderedMap(),
      tracks: this.tracks.map(t => t.clone()).toOrderedMap(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Audio {

    const t = (root as any).audio;

    let model = new Audio({ guid });

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
