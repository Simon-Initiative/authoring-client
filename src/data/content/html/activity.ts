import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Image } from './image';
import { Maybe, Nothing } from '../../../utils/types';

export type ActivityParams = {
  idref?: string,
  purpose?: string,
  image?: Maybe<Image>,
  guid?: string,
};

const defaultContent = {
  idref: '',
  purpose: 'checkpoint',
  image: Nothing,
  guid: '',
};

export class Activity extends Immutable.Record(defaultContent) {
  
  contentType: 'Activity';
  idref: string;
  purpose: string;
  image: Maybe<Image>;
  guid: string;
  
  constructor(params?: ActivityParams) {
    super(augment(params));
  }

  with(values: ActivityParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, toDraft) : Activity {

    const t = (root as any).activity;

    let model = new Activity({ guid });
    
    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: t['@purpose'] });
    }

    getChildren(t).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'image':
          model = model.with({ image: Image.fromPersistence(item, id, toDraft) });
          break;
        default:
      }
    });
    
    return model;
  }

  toPersistence() : Object {
    return {
      activity: {
        '@idref': this.idref,
        '@purpose': this.purpose,
        '#array': this.image === Nothing ? [] : [this.image.toPersistence],
      },
    };
  }
}
