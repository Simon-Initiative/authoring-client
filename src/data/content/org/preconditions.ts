import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import * as types from './types';
import { Precondition } from './precondition';
import createGuid from '../../../utils/guid';

export type PreconditionsParams = {
  preconditions?: Immutable.OrderedMap<string, Precondition>,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Preconditions,
  preconditions: Immutable.OrderedMap<string, Precondition>(),
  guid: '',
};

export class Preconditions extends Immutable.Record(defaultContent) {
  
  contentType: types.ContentTypes.Preconditions;
  preconditions?: Immutable.OrderedMap<string, Precondition>;
  guid: string;
  
  constructor(params?: PreconditionsParams) {
    super(augment(params));
  }

  with(values: PreconditionsParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const s = (root as any).preconditions;
    let model = new Preconditions({ guid });

    getChildren(s).forEach((item) => {
      
      const key = getKey(item);
      const id = createGuid();
     
      switch (key) {
        case 'precondition':
          model = model.with(
            { preconditions: model.preconditions.set(id, Precondition.fromPersistence(item, id)) });
          break;
        default:
          
      }
    });
    
    return model;
  }

  toPersistence() : Object {
    
    const s = { 
      preconditions: {
        '#array': this.preconditions.toArray().map(s => s.toPersistence()),
      }, 
    };

    return s;
  }
}
