import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import createGuid from '../../../utils/guid';
import { augment } from '../common';
import { DndLayout } from './dragdrop/dnd_layout';

export type CustomParams = {
  id?: string;
  guid?: string;
  type?: string;
  layout?: string;
  layoutData?: Maybe<DndLayout>;
  src?: string;
  width?: number;
  height?: number;
  logging?: boolean;
  paramName?: string;
  paramText?: string;
};

const defaultContent = {
  contentType: 'Custom',
  id: '',
  guid: '',
  type: '',
  layout: '',
  layoutData: Maybe.nothing(),
  src: '',
  width: 0,
  height: 0,
  logging: false,
  paramName: '',
  paramText: '',
};

export class Custom extends Immutable.Record(defaultContent) {

  contentType: 'Custom';
  id: string;
  guid: string;
  type: string;
  layout: string;
  layoutData: Maybe<DndLayout>;
  src: string;
  width: number;
  height: number;
  logging: boolean;
  paramName: string;
  paramText: string;

  constructor(params?: CustomParams) {
    super(augment(params));
  }

  with(values: CustomParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({ id: createGuid() });
  }

  static fromPersistence(json: Object, guid: string) : Custom {

    const q = (json as any).custom;
    let model = new Custom({ guid });

    if (q['@id'] !== undefined) {
      model = model.with({ id: q['@id'] });
    }
    if (q['@type'] !== undefined) {
      model = model.with({ type: q['@type'] });
    }
    if (q['@logging'] !== undefined) {
      model = model.with({ logging: q['@logging'] });
    }
    if (q['@src'] !== undefined) {
      model = model.with({ src: q['@src'] });
    }
    if (q['@width'] !== undefined) {
      model = model.with({ width: q['@width'] });
    }
    if (q['@height'] !== undefined) {
      model = model.with({ height: q['@height'] });
    }
    if (q['@layout'] !== undefined) {
      model = model.with({ layout: q['@layout'] });
    }
    if (q['param'] !== undefined) {
      model = model.with({
        paramName: q['param']['@name'],
        paramText: q['param']['#text'],
      });
    }

    if (q['layoutData'] !== undefined) {
      model = model.with({
        layoutData: Maybe.just(DndLayout.fromPersistence(q['layoutData'], createGuid())) });
    }

    return model;

  }

  toPersistence() : Object {
    return {
      custom: {
        '@id': this.id,
        '@type': this.type,
        '@logging': this.logging,
        '@src': this.src,
        '@width': this.width,
        '@height': this.height,
        '@layout': this.layout,
        param: {
          '@name': this.paramName,
          '#text': this.paramText,
        },
        layoutData: this.layoutData.caseOf({
          just: ld => ld.toPersistence(),
          nothing: () => undefined,
        }),
      },
    };
  }
}
