import * as Immutable from 'immutable';
import { augment } from '../common';

import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common/elements';

export type MaterialParams = {
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Material',
  content: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
  guid: '',
};

export class Material extends Immutable.Record(defaultContent) {

  contentType: 'Material';
  content: ContentElements;
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

  static fromText(text: string, guid: string) : Material {
    return new Material().with({
      guid,
      content: ContentElements.fromText(text, '', Immutable.List(MATERIAL_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string) : Material {

    const cb = (root as any).material;

    return new Material({ guid, content: ContentElements
      .fromPersistence(cb, '', MATERIAL_ELEMENTS) });
  }

  toPersistence() : Object {

    const content = this.content.content.size === 0
       ? [{ p: { '#text': ' ' } }]
       : this.content.toPersistence();

    return {
      material: {
        '#array': content,
      },
    };
  }
}
