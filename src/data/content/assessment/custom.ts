import * as Immutable from 'immutable';

import { Choice } from './choice';
import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { DndLayout } from './dragdrop/dnd_layout';

export type CustomParams = {
  id?: string,
  guid?: string,

  type?: string,
  layout?: string,
  layoutData?: DndLayout,
  src?: string,
  width?: number,
  height?: number,
  logging?: boolean,
  param?: {
    name: string,
    text: string,
  },
};

const defaultContent = {
  contentType: 'Custom',
  id: '',
  guid: '',
  type: '',
  layout: '',
  layoutData: new DndLayout(),
  src: '',
  width: 0,
  height: 0,
  logging: false,
  param: {
    name: '',
    text: '',
  },
};

export class Custom extends Immutable.Record(defaultContent) {

  contentType: 'Custom';
  id: string;
  guid: string;
  type: string;
  layout: string;
  layoutData: DndLayout;
  src: string;
  width: number;
  height: number;
  logging: boolean;
  param: {
    name: string;
    text: string;
  };

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
      model = model.with({ param: q['param'] });
    }

    if (q['layoutData'] !== undefined) {
      model = model.with({ layoutData: DndLayout.fromPersistence(q['layoutData'], createGuid()) });
    }

    return model;

  }

  toPersistence() : Object {
    return {
      custom: {
        '@id': this.id,
        '@type': this.id,
        '@logging': this.id,
        '@src': this.id,
        '@width': this.id,
        '@height': this.id,
        '@layout': this.layout,
        param: {
          '@name': this.param.name,
          '#text': this.param.text,
        },
        layoutData: this.layoutData.toPersistence(),
      },
    };
  }
}
