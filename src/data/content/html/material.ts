import * as Immutable from 'immutable';
import { augment } from '../common';
import { MaterialContent } from '../types/material';

export type MaterialParams = {
  content?: MaterialContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Material',
  content: new MaterialContent(),
  guid: '',
};

export class Material extends Immutable.Record(defaultContent) {

  contentType: 'Material';
  content: MaterialContent;
  guid: string;

  constructor(params?: MaterialParams) {
    super(augment(params));
  }

  with(values: MaterialParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Material {

    const cb = (root as any).material;

    return new Material({ guid, content: MaterialContent.fromPersistence(cb, '') });
  }

  toPersistence() : Object {
    return {
      material: {
        '#array': this.content.toPersistence(),
      },
    };
  }
}
