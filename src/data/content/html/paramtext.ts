import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment } from '../common';
import { getKey } from '../../common';

export type ParamTextParams = {
  text?: string,
  guid?: string
};

const defaultContent = {
  contentType: 'ParamText',
  text: '',
  guid: ''
}

export class ParamText extends Immutable.Record(defaultContent) {
  
  contentType: 'ParamText';
  text: string;
  guid: string;
  
  constructor(params?: ParamTextParams) {
    super(augment(params));
  }

  with(values: ParamTextParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : ParamText {

    let p = (root as any);

    let model = new ParamText({ guid });
    
    if (p['#text'] !== undefined) {
      model = model.with({ text: p['#text']});
    }
    
    return model;
  }

  toPersistence() : Object {
    return {
      '#text': this.text
    };
  }
}
