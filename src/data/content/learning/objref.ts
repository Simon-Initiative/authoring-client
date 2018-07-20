import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type ObjRefParams = {
  idref?: string;
  guid?: string;
};

const defaultObjRefParams = {
  contentType: 'ObjRef',
  elementType: 'objref',
  idref: '',
  guid: '',
};

export class ObjRef extends Immutable.Record(defaultObjRefParams) {

  contentType: 'ObjRef';
  elementType: 'objref';
  idref: string;
  guid: string;

  constructor(params?: ObjRefParams) {
    super(augment(params));
  }

  with(values: ObjRefParams) {
    return this.merge(values) as this;
  }


  clone() : ObjRef {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(json: any, guid: string, notify?: () => void) {

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
