import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Param } from './param';

export type WbInlineParams = {
  idRef?: string,
  src?: string,
  width?: string,
  height?: string,
  purpose?: string,
  params?: Immutable.OrderedMap<string, Param>,
  guid?: string,
};

const defaultContent = {
  contentType: 'WbInline',
  idRef: '',
  src: '',
  width: '',
  height: '',
  purpose: 'learnbydoing',
  params: Immutable.OrderedMap<string, Param>(),
  guid: '',
};

export class WbInline extends Immutable.Record(defaultContent) {
  
  contentType: 'WbInline';
  idRef: string;
  src: string;
  width: string;
  height: string;
  purpose: string;
  params: Immutable.OrderedMap<string, Param>;
  guid: string;
  
  constructor(params?: WbInlineParams) {
    super(augment(params));
  }

  with(values: WbInlineParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : WbInline {

    const wb = (root as any)['wb:inline'];

    let model = new WbInline({ guid });
    
    if (wb['@idref'] !== undefined) {
      model = model.with({ idRef: wb['@idref'] });
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
      model = model.with({ purpose: wb['@purpose'] });
    }

    getChildren(wb).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'param':
          model = model.with({ params: model.params.set(id, Param.fromPersistence(item, id)) });
          break;
        default:
          
      }
    });
    
    
    return model;
  }

  toPersistence() : Object {
    return {
      'wb:inline': {
        '@idref': this.idRef,
        '@src': this.src,
        '@height': this.height,
        '@width': this.width,
        '@purpose': this.purpose,
        '#array': this.params.toArray().map(p => p.toPersistence()),
      },
    };
  }
}
