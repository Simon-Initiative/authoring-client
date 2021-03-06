import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
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
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  guid?: string,
};

const defaultContent = {
  contentType: 'Panopto',
  elementType: 'panopto',
  id: '',
  width: '800',
  height: '450',
  src: '',
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: Title.fromText(''),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class Panopto extends Immutable.Record(defaultContent) {

  contentType: 'Panopto';
  elementType: 'panopto';
  id: string;
  width: string;
  height: string;
  src: string;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  guid: string;

  constructor(params?: PanoptoParams) {
    super(augment(params, true));
  }

  with(values: PanoptoParams) {
    return this.merge(values) as this;
  }

  clone() : Panopto {
    return ensureIdGuidPresent(this.with({
      popout: this.popout.clone(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
    }));
  }


  static fromPersistence(root: Object, guid: string, notify: () => void) : Panopto {

    const t = (root as any).panopto;

    let model = new Panopto({ guid });

    model = setId(model, t, notify);

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

  toPersistence() : Object {

    const children = [
      this.titleContent.toPersistence(),
      this.cite.toPersistence(),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
    ];

    return {
      panopto: {
        '@id': this.id ? this.id : createGuid(),
        '@height': this.height,
        '@width': this.width,
        '@src': this.src,
        '#array': children,
      },
    };
  }
}
