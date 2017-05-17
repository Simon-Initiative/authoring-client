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

export type YouTubeParams = {
  id?: string,
  title?: string,
  src?: string,
  width?: string,
  height?: string,
  popout?: Immutable.OrderedMap<string, Popout>,
  alternate?: Immutable.OrderedMap<string, Alternate>,
  titleContent?: Immutable.OrderedMap<string, Title>,
  caption?: Immutable.OrderedMap<string, Caption>,
  cite?: Immutable.OrderedMap<string, Cite>,
  guid?: string,
};

const defaultContent = {
  contentType: 'YouTube',
  id: '',
  title: '',
  src: '',
  width: '500',
  height: '300',
  popout: Immutable.OrderedMap<string, Popout>(),
  alternate: Immutable.OrderedMap<string, Alternate>(),
  titleContent: Immutable.OrderedMap<string, Title>(),
  caption: Immutable.OrderedMap<string, Caption>(),
  cite: Immutable.OrderedMap<string, Cite>(),
  guid: '',
};

export class YouTube extends Immutable.Record(defaultContent) {
  
  contentType: 'YouTube';
  id: string;
  title: string;
  src: string;
  width: string;
  height: string;
  popout: Immutable.OrderedMap<string, Popout>;
  alternate: Immutable.OrderedMap<string, Alternate>;
  titleContent: Immutable.OrderedMap<string, Title>;
  caption: Immutable.OrderedMap<string, Caption>;
  cite: Immutable.OrderedMap<string, Cite>;
  guid: string;
  
  constructor(params?: YouTubeParams) {
    super(augment(params));
  }

  with(values: YouTubeParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : YouTube {

    const t = (root as any).youtube;

    let model = new YouTube({ guid });
    
    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    }
    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
    }
    if (t['@height'] !== undefined) {
      model = model.with({ height: t['@height'] });
    }
    if (t['@width'] !== undefined) {
      model = model.with({ width: t['@width'] });
    }
    
    getChildren(t).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
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
    ];

    return {
      youtube: {
        '@id': this.id,
        '@title': this.title,
        '@src': this.src,
        '@height': this.height,
        '@width': this.width,
        '#array': children,
      }, 
    };
  }
}
