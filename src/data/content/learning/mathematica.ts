import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Popout } from './popout';
import { Alternate } from './alternate';
import { Title } from './title';
import { Caption } from './caption';
import { Cite } from './cite';
import { Maybe } from 'tsmonad';

export type MathematicaParams = {
  id?: string,
  width?: string,
  height?: string,
  src?: string,
  purpose?: Maybe<string>,
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  guid?: string,
};

const defaultContent = {
  contentType: 'Mathematica',
  elementType: 'mathematica',
  id: createGuid(),
  width: '800',
  height: '450',
  src: '',
  purpose: Maybe.nothing(),
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: Title.fromText(''),
  caption: new Caption(),
  cite: new Cite(),
  guid: '',
};

export class Mathematica extends Immutable.Record(defaultContent) {

  contentType: 'Mathematica';
  elementType: 'mathematica';
  id: string;
  width: string;
  height: string;
  src: string;
  purpose: Maybe<string>;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  guid: string;

  constructor(params?: MathematicaParams) {
    super(augment(params));
  }

  with(values: MathematicaParams) {
    return this.merge(values) as this;
  }

  clone() : Mathematica {
    return this.with({
      id: createGuid(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
    });
  }


  static fromPersistence(root: Object, guid: string) : Mathematica {

    const t = (root as any).mathematica;

    let model = new Mathematica({ guid });

    if (t['@id']) {
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
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
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
          model = model.with({ cite: Cite.fromPersistence(item, id) });
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
      mathematica: {
        '@id': this.id,
        '@height': this.height,
        '@width': this.width,
        '@src': this.src,
        '@purpose': this.purpose.caseOf({ just: p => p, nothing: () => undefined }),
        '#array': children,
      },
    };
  }
}
