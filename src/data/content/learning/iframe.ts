import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
import { getKey } from '../../common';
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
  elementType: 'iframe',
  id: '',
  title: '',
  src: 'https://www.example.com',
  width: '800',
  height: '450',
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: new Title(),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class IFrame extends Immutable.Record(defaultContent) {

  contentType: 'IFrame';
  elementType: 'iframe';
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
    super(augment(params, true));
  }

  with(values: IFrameParams) {
    return this.merge(values) as this;
  }

  clone(): IFrame {
    return ensureIdGuidPresent(this.with({
      popout: this.popout.clone(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
    }));
  }


  static fromPersistence(root: Object, guid: string, notify: () => void): IFrame {

    const t = (root as any).iframe;

    let model = new IFrame({ guid });

    model = setId(model, t, notify);

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
          model = model.with({ popout: Popout.fromPersistence(item, id, notify) });
          break;
        case 'alternate':
          model = model.with({
            alternate: Alternate.fromPersistence(item, id, notify),
          });
          break;
        case 'title':
          model = model.with({
            titleContent: Title.fromPersistence(item, id, notify),
          });
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

    const children = [
      this.titleContent.toPersistence(),
      this.cite.toPersistence(),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
    ];

    return {
      iframe: {
        '@id': this.id ? this.id : createGuid(),
        '@title': this.title,
        '@src': this.src === '' ? 'http://www.google.com' : this.src,
        '@height': this.height,
        '@width': this.width,
        '#array': children,
      },
    };
  }
}
