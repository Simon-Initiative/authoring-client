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

export type IFrameParams = {
  id?: string,
  title?: string,
  src?: string,
  width?: string,
  height?: string,
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  guid?: string,
};

const defaultContent = {
  contentType: 'IFrame',
  id: '',
  title: '',
  src: '',
  width: '500',
  height: '300',
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: new Title(),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class IFrame extends Immutable.Record(defaultContent) {
  
  contentType: 'IFrame';
  id: string;
  title: string;
  src: string;
  width: string;
  height: string;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  guid: string;
  
  constructor(params?: IFrameParams) {
    super(augment(params));
  }

  with(values: IFrameParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, toDraft) : IFrame {

    const t = (root as any).iframe;

    let model = new IFrame({ guid });
    
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
    
    return model;
  }

  toPersistence(toP) : Object {

    const children = [
      this.titleContent.toPersistence(),
      this.cite.toPersistence(toP),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
    ];

    return {
      iframe: {
        '@id': this.id,
        '@title': this.title,
        '@src': this.src === '' ? 'http://www.google.com' : this.src,
        '@height': this.height,
        '@width': this.width,
        '#array': children,
      }, 
    };
  }
}
