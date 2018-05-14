import * as Immutable from 'immutable';
import { augment } from './common';

export type UnsupportedParams = {
  contentType?: 'Unsupported',
  data: Object,
  guid: string,
};

export class Unsupported extends Immutable.Record(
  { contentType: 'Unsupported', guid: '', data: {} }) {

  contentType: 'Unsupported';
  elementType: 'unsupported';
  data: Object;
  guid: string;

  constructor(params?: UnsupportedParams) {
    super(augment(params));
  }

  with(values: UnsupportedParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this;
  }

  toPersistence() : Object {
    return this.data;
  }

  static fromPersistence(data: Object, guid: string) : Unsupported {
    return new Unsupported().with({ data, guid });
  }
}
