import * as Immutable from 'immutable';
import { augment } from './common';

export type ObjRefParams = {
  idref?: string;
  guid?: string;
};

const defaultObjRefParams = {
  contentType: 'ObjRef',
  idref: '',
  guid: '',
};

export class ObjRef extends Immutable.Record(defaultObjRefParams) {

  contentType: 'ObjRef';
  idref: string;
  guid: string;
  
  constructor(params?: ObjRefParams) {
    super(augment(params));
  }

  with(values: ObjRefParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string) {

    let model = new ObjRef({ guid });

    const s = json.objref;

    if (s['@idref'] !== undefined) {
      model = model.with({ idref: s['@idref'] });
    }
    
    return model;
  }

  toPersistence() : Object {

    return {
      objref: {
        '@idref': this.idref,
      },
    };
  }
}
