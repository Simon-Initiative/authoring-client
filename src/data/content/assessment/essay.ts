import * as Immutable from 'immutable';
import { augment, setId, ensureIdGuidPresent } from '../common';

export type EssayParams = {
  id?: string,
  name?: string,
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
  id: string;
  name: string;
  guid: string;

  constructor(params?: EssayParams) {
    super(augment(params));
  }

  clone(): Essay {
    return ensureIdGuidPresent(this);
  }

  with(values: EssayParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void): Essay {

    const n = (json as any).essay;
    let model = new Essay({ guid });

    model = setId(model, n, notify);

    if (n['@name'] !== undefined) {
      model = model.with({ name: n['@name'] });
    }

    return model;

  }

  toPersistence(): Object {

    return {
      essay: {
        '@id': this.id,
        '@name': this.name,
      },
    };
  }
}
