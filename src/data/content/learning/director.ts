import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { Popout } from 'data/content/learning/popout';
import { Alternate } from 'data/content/learning/alternate';
import { Title } from 'data/content/learning/title';
import { Caption } from 'data/content/learning/caption';
import { Cite } from 'data/content/learning/cite';
import { Maybe } from 'tsmonad';

export type DirectorParams = {
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
  contentType: 'Director',
  elementType: 'director',
  id: '',
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

export class Director extends Immutable.Record(defaultContent) {

  contentType: 'Director';
  elementType: 'director';
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

  constructor(params?: DirectorParams) {
    super(augment(params));
  }

  with(values: DirectorParams) {
    return this.merge(values) as this;
  }

  clone() : Director {
    return this.with({
      id: createGuid(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
    });
  }


  static fromPersistence(root: Object, guid: string) : Director {

    const t = (root as any).director;

    let model = new Director({ guid });

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
      director: {
        '@id': this.id,
        '@height': this.height,
        '@width': this.width,
        '@purpose': this.purpose.caseOf({ just: p => p, nothing: () => undefined }),
        '@src': this.src,
        '#array': children,
      },
    };
  }
}
