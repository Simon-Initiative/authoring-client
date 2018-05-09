import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Popout } from './popout';
import { Alternate } from './alternate';
import { Title } from './title';
import { Caption } from './caption';
import { Cite } from './cite';

export type PanoptoParams = {
  id?: string,
  width?: string,
  height?: string,
  src?: string,
  popout?: Popout,
  alternate?: Alternate,
  title?: Title,
  caption?: Caption,
  cite?: Cite,
  guid?: string,
};

const defaultContent = {
  contentType: 'Panopto',
  id: '',
  width: '800',
  height: '450',
  src: '',
  popout: new Popout(),
  alternate: new Alternate(),
  title: Title.fromText(''),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class Panopto extends Immutable.Record(defaultContent) {

  contentType: 'Panopto';
  id: string;
  width: string;
  height: string;
  src: string;
  popout: Popout;
  alternate: Alternate;
  title: Title;
  caption: Caption;
  cite: Cite;
  guid: string;

  constructor(params?: PanoptoParams) {
    super(augment(params));
  }

  with(values: PanoptoParams) {
    return this.merge(values) as this;
  }

  clone() : Panopto {
    return this.with({
      id: createGuid(),
      alternate: this.alternate.clone(),
      title: this.title.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
    });
  }


  static fromPersistence(root: Object, guid: string) : Panopto {

    const t = (root as any).panopto;

    let model = new Panopto({ guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
    if (t['@height'] !== undefined) {
      model = model.with({ height: t['@height'] });
    }
    if (t['@width'] !== undefined) {
      model = model.with({ width: t['@width'] });
    }
    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
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
            { title: Title.fromPersistence(item, id) });
          break;
        case 'caption':
          model = model.with({ caption: Caption.fromPersistence(item, id) });
          break;
        case 'cite':
          model = model.with({ cite: Cite.fromPersistence(item, id) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence() : Object {

    const children = [
      this.title.toPersistence(),
      this.cite.toPersistence(),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
    ];

    return {
      panopto: {
        '@id': this.id,
        '@height': this.height,
        '@width': this.width,
        '@src': this.src,
        '#array': children,
      },
    };
  }
}
