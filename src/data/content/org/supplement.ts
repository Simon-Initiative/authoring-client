import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Maybe } from 'tsmonad';
import * as types from './types';

export type SupplementParams = {
  idref?: string,
  title?: Maybe<string>,
  purpose?: Maybe<types.PurposeTypes>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Supplement,
  title: Maybe.nothing<string>(),
  idref: '',
  purpose: Maybe.nothing<types.PurposeTypes>(),
  guid: '',
};

export class Supplement extends Immutable.Record(defaultContent) {
  
  contentType: types.ContentTypes.Supplement;
  title: Maybe<string>;
  idref: string;
  purpose: Maybe<types.PurposeTypes>;
  guid: string;
  
  constructor(params?: SupplementParams) {
    super(augment(params));
  }

  with(values: SupplementParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).supplement;
    let model = new Supplement({ guid });

    if (s['@idref'] !== undefined) {
      model = model.with({ idref: s['@idref'] });
    }
    if (s['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(s['@purpose']) });
    }

    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
     
      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(item['title']['#text']) });
          break;
        default:
          
      }
    });
    
    return model;
  }

  toPersistence() : Object {
    
    const s = { 
      supplement: {
        '@idref': this.idref,
      }, 
    };

    this.purpose.lift(p => s.supplement['@purpose'] = p);
    this.title.lift(text => s.supplement['#array'] = [{ title: { '#text': text } }]);
    
    return s;
  }
}
