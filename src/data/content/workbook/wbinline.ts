import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';
import { Param } from '../learning/param';
import { Maybe } from 'tsmonad';

export type WbInlineParams = {
  idref?: string,
  src?: string,
  width?: string,
  height?: string,
  purpose?: Maybe<string>,
  params?: Immutable.OrderedMap<string, Param>,
  guid?: string,
};

const defaultContent = {
  contentType: 'WbInline',
  elementType: 'wb:inline',
  idref: '',
  src: '',
  width: '',
  height: '',
  purpose: Maybe.nothing<string>(),
  params: Immutable.OrderedMap<string, Param>(),
  guid: '',
};

export class WbInline extends Immutable.Record(defaultContent) {

  contentType: 'WbInline';
  elementType: 'wb:inline';
  idref: string;
  src: string;
  width: string;
  height: string;
  purpose: Maybe<string>;
  params: Immutable.OrderedMap<string, Param>;
  guid: string;

  constructor(params?: WbInlineParams) {
    super(augment(params));
  }

  with(values: WbInlineParams) {
    return this.merge(values) as this;
  }

  clone(): WbInline {
    return ensureIdGuidPresent(this.with({
      params: this.params.mapEntries(([_, v]) => {
        const clone: Param = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Param>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): WbInline {

    const wb = (root as any)['wb:inline'];

    let model = new WbInline({ guid });

    if (wb['@idref'] !== undefined) {
      model = model.with({ idref: wb['@idref'] });
    }
    if (wb['@src'] !== undefined) {
      model = model.with({ src: wb['@src'] });
    }
    if (wb['@height'] !== undefined) {
      model = model.with({ height: wb['@height'] });
    }
    if (wb['@width'] !== undefined) {
      model = model.with({ width: wb['@width'] });
    }
    if (wb['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(wb['@purpose']) });
    }

    getChildren(wb).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
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
    const wbinline = {
      'wb:inline': {
        '@idref': this.idref,
        '@src': this.src,
        '@height': this.height,
        '@width': this.width,
        '#array': this.params.toArray().map(p => p.toPersistence()),
      },
    };
    this.purpose.lift(p => wbinline['wb:inline']['@purpose'] = p);
    return wbinline;
  }
}
