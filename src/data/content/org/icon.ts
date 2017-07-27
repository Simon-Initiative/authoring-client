import * as Immutable from 'immutable';

import { Html } from '../html';
import { augment } from '../common';
import { getKey } from '../../common';
import * as types from './types';

export type IconParams = {
  href?: string,
  mime_type?: string,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Icon,
  href: '',
  mime_type: '',
  guid: '',
};

export class Icon extends Immutable.Record(defaultContent) {
  
  contentType: types.ContentTypes.Icon;
  href: string;

  // tslint:disable-next-line
  mime_type: string;
  guid: string;
  
  constructor(params?: IconParams) {
    super(augment(params));
  }

  with(values: IconParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const icon = (root as any).icon;
    let model = new Icon({ guid });

    if (icon['@href'] !== undefined) {
      model = model.with({ href: icon['@href'] });
    }
    if (icon['@mime_type'] !== undefined) {
      model = model.with({ mime_type: icon['@mime_type'] });
    }
    
    return model;
  }

  toPersistence() : Object {
    
    return  { 
      icon: {
        '@href': this.href,
        '@mime_type': this.mime_type,
      }, 
    };
  }
}
