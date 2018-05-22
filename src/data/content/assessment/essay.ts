import * as Immutable from 'immutable';
import { augment } from '../common';
import createGuid from 'utils/guid';

export type EssayParams = {
  id? : string,
  name? : string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Essay',
  elementType: 'essay',
  id: '',
  name: '',
  guid: '',
};

export class Essay extends Immutable.Record(defaultContent) {

  contentType: 'Essay';
  elementType: 'essay';
  id : string;
  name : string;
  guid: string;

  constructor(params?: EssayParams) {
    super(augment(params));
  }

  clone() : Essay {
    return this.with({
      id: createGuid(),
    });
  }

  with(values: EssayParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : Essay {

    const n = (json as any).essay;
    let model = new Essay({ guid });

    if (n['@id'] !== undefined) {
      model = model.with({ id: n['@id'] });
    }
    if (n['@name'] !== undefined) {
      model = model.with({ name: n['@name'] });
    }

    return model;

  }

  toPersistence() : Object {

    return {
      essay: {
        '@id': this.id,
        '@name': this.name,
      },
    };
  }
}
