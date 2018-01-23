import * as Immutable from 'immutable';
import { augment } from '../common';

export type MaterialParams = {
  enable?: boolean,
  content?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'material',
  enable: true,
  content: '',
  guid: '',
};

export class Material extends Immutable.Record(defaultContent) {

  contentType: 'material';
  enable: boolean;
  content: string;
  guid: string;

  constructor(params?: MaterialParams) {
    super(augment(params));
  }

  with(values: MaterialParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Material {

    const cb = (root as any).material;

    let model = new Material({ guid });

    return model;
  }

  toPersistence() : Object {
    return {
      material: {

      },
    };
  }
}
