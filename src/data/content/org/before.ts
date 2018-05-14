import * as Immutable from 'immutable';
import { augment } from '../common';

export type BeforeParams = {
  idref?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Before',
  elementType: 'before',
  idref: '',
  guid: '',
};

export class Before extends Immutable.Record(defaultContent) {

  contentType: 'Before';
  elementType: 'before';
  idref: string;
  guid: string;

  constructor(params?: BeforeParams) {
    super(augment(params));
  }

  with(values: BeforeParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const before = (root as any).before;
    let model = new Before({ guid });

    if (before['@idref'] !== undefined) {
      model = model.with({ idref: before['@idref'] });
    }

    return model;
  }

  toPersistence() : Object {

    return  {
      before: {
        '@idref': this.idref,
      },
    };
  }
}
