import * as Immutable from 'immutable';

import createGuid from '../../utils/guid';
import { augment, getChildren } from './common';
import { getKey } from '../common';

export type EssayParams = {
  id? : string,
  name? : string,
  guid?: string
};

const defaultContent = {
  id: '',
  name: '',
  guid: '',
  contentType: 'Essay',
};

export class Essay extends Immutable.Record(defaultContent) {
  
  contentType: 'Essay';
  id : string;
  name : string;
  guid: string;
  
  constructor(params?: EssayParams) {
    super(augment(params));
  }

  with(values: EssayParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : Essay {
    
    let n = (json as any).essay;
    let model = new Essay({ guid });

    if (n['@id'] !== undefined) {
      model = model.with({ id: n['@id']});
    }
    if (n['@name'] !== undefined) {
      model = model.with({ name: n['@name']});
    }
    
    return model;

  }

  toPersistence() : Object {

    return {
      "essay": {
        "@id": this.id,
        "@name": this.name,
      }
    }
  }
}
