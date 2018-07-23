import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
import { getKey } from '../../common';
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
  controls?: boolean,
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  guid?: string,
};

const defaultContent = {
  contentType: 'YouTube',
  elementType: 'youtube',
  id: '',
  title: '',
  src: 'J1neqSGaCX0',
  width: '500',
  height: '300',
  controls: true,
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: new Title(),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class YouTube extends Immutable.Record(defaultContent) {

  contentType: 'YouTube';
  elementType: 'youtube';
  id: string;
  title: string;
  src: string;
  width: string;
  height: string;
  controls: boolean;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  guid: string;

  constructor(params?: YouTubeParams) {
    super(augment(params, true));
  }

  with(values: YouTubeParams) {
    return this.merge(values) as this;
  }

  clone(): YouTube {
    return ensureIdGuidPresent(this.with({
      popout: this.popout.clone(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): YouTube {

    const t = (root as any).youtube;

    let model = new YouTube({ guid });

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
    if (t['@controls'] !== undefined) {
      model = model.with({ controls: t['@controls'] === 'true' });
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

  toPersistence(): Object {

    const children = [
      this.titleContent.toPersistence(),
      this.cite.toPersistence(),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
    ];

    return {
      youtube: {
        '@id': this.id ? this.id : createGuid(),
        '@title': this.title,
        '@src': this.src === '' ? 'C0DPdy98e4c' : this.src,
        '@height': this.height,
        '@width': this.width,
        '@controls': this.controls ? 'true' : 'false',
        '#array': children,
      },
    };
  }
}
