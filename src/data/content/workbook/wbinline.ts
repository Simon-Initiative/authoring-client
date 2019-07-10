import * as Immutable from 'immutable';
import createGuid from '../../../utils/guid';
import { getChildren, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';
import { Param } from '../learning/param';
import { Maybe } from 'tsmonad';
import { ResourceId } from 'data/types';

export type WbInlineParams = {
  idref?: ResourceId,
  src?: string,
  width?: string,
  height?: string,
  purpose?: Maybe<string>,
  params?: Immutable.OrderedMap<string, Param>,
  guid?: string,
};

const defaults = (params: Partial<WbInlineParams> = {}) => ({
  contentType: 'WbInline',
  elementType: 'wb:inline',
  guid: params.guid || createGuid(),
  idref: params.idref || ResourceId.of(''),
  src: params.src || '',
  width: params.width || '',
  height: params.height || '',
  purpose: params.purpose || Maybe.just('learnbydoing'),
  params: params.params || Immutable.OrderedMap<string, Param>(),
});

export class WbInline extends Immutable.Record(defaults()) {

  contentType: 'WbInline';
  elementType: 'wb:inline';
  idref: ResourceId;
  src: string;
  width: string;
  height: string;
  purpose: Maybe<string>;
  params: Immutable.OrderedMap<string, Param>;
  guid: string;

  constructor(params?: WbInlineParams) {
    super(defaults(params));
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
      model = model.with({ idref: ResourceId.of(wb['@idref']) });
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
        '@idref': this.idref.value(),
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
