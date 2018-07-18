import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import createGuid from '../../../utils/guid';
import { augment } from '../common';
import { LegacyLayout } from './dragdrop/legacyLayout/legacy_layout';
import { HTMLLayout } from './dragdrop/htmlLayout/html_layout';
import { convertLegacyToHtmlTable } from 'data/content/assessment/dragdrop/convert';

export type CustomParams = {
  id?: string;
  guid?: string;
  type?: string;
  layout?: string;
  layoutData?: Maybe<HTMLLayout>;
  src?: string;
  width?: number;
  height?: number;
  logging?: boolean;
  paramName?: string;
  paramText?: string;
};

const defaultContent = {
  contentType: 'Custom',
  elementType: 'custom',
  id: '',
  guid: '',
  type: 'javascript',
  layout: '',
  layoutData: Maybe.nothing<HTMLLayout>(),
  src: '',
  width: 100,
  height: 100,
  logging: false,
  paramName: 'showInputs',
  paramText: 'false',
};

export class Custom extends Immutable.Record(defaultContent) {

  contentType: 'Custom';
  elementType: 'custom';
  id: string;
  guid: string;
  type: string;
  layout: string;
  layoutData: Maybe<HTMLLayout>;
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
    return this.with({
      id: createGuid(),
      layout: '',
      layoutData: this.layoutData.lift(ld => ld.clone()),
      src: 'DynaDrop.js',
    });
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
      if (q['layoutData'].dragdrop
        && q['layoutData'].dragdrop['#array']
        && q['layoutData'].dragdrop['#array'].find(obj => obj.hasOwnProperty('targetArea'))) {
        // HTML Layout
        model = model.with({
          layoutData: Maybe.just(HTMLLayout.fromPersistence(q['layoutData'], createGuid())) });
      } else {
        // Convert Legacy Layout to HTML Layout
        const convertedLayout =
          convertLegacyToHtmlTable(LegacyLayout.fromPersistence(q['layoutData'], createGuid()));
        model = model.with({
          layoutData: Maybe.just(convertedLayout),
        });
      }
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
