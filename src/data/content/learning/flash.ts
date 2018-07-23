import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
import { getKey } from '../../common';
import { Popout } from './popout';
import { Alternate } from './alternate';
import { Title } from './title';
import { Caption } from './caption';
import { Cite } from './cite';
import { Param } from './param';
import { Maybe } from 'tsmonad';

export type FlashParams = {
  id?: string,
  width?: string,
  height?: string,
  logging?: boolean,
  src?: string,
  purpose?: Maybe<string>,
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  params?: Immutable.OrderedMap<string, Param>;
  guid?: string,
};

const defaultContent = {
  contentType: 'Flash',
  elementType: 'flash',
  id: '',
  width: '800',
  height: '450',
  logging: true,
  src: '',
  purpose: Maybe.nothing(),
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: Title.fromText(''),
  caption: new Caption(),
  cite: new Cite(),
  params: Immutable.OrderedMap<string, Param>(),
  guid: '',
};

export class Flash extends Immutable.Record(defaultContent) {

  contentType: 'Flash';
  elementType: 'flash';
  id: string;
  width: string;
  height: string;
  src: string;
  logging: boolean;
  purpose: Maybe<string>;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  params: Immutable.OrderedMap<string, Param>;
  guid: string;

  constructor(params?: FlashParams) {
    super(augment(params, true));
  }

  with(values: FlashParams) {
    return this.merge(values) as this;
  }

  clone(): Flash {
    return ensureIdGuidPresent(this.with({
      popout: this.popout.clone(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
      params: this.params.mapEntries(([_, v]) => {
        const clone: Param = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Param>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Flash {

    const t = (root as any).flash;

    let model = new Flash({ guid });

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
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }
    if (t['@logging'] !== undefined) {
      model = model.with(
        { logging: t['@logging'] === 'true' ? true : false });
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
        case 'param':
          model = model.with({
            params: model.params.set(id, Param.fromPersistence(item, id, notify)),
          });
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

    this.params.toArray().forEach(t => children.push(t.toPersistence()));

    return {
      flash: {
        '@id': this.id ? this.id : createGuid(),
        '@height': this.height,
        '@width': this.width,
        '@logging': this.logging ? 'true' : 'false',
        '@purpose': this.purpose.caseOf({ just: p => p, nothing: () => undefined }),
        '@src': this.src,
        '#array': children,
      },
    };
  }
}
