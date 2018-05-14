import * as Immutable from 'immutable';

import { augment, getChildren } from '../common';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';

export type CodeParams = {
  text?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Code',
  elementType: 'code',
  text: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class Code extends Immutable.Record(defaultContent) {

  contentType: 'Code';
  elementType: 'code';
  text: ContentElements;
  guid: string;

  constructor(params?: CodeParams) {
    super(augment(params));
  }

  with(values: CodeParams) {
    return this.merge(values) as this;
  }

  clone() : Code {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Code {

    const t = (root as any).code;

    const text = ContentElements.fromPersistence(getChildren(t), '', INLINE_ELEMENTS);
    return new Code({ guid, text });

  }

  toPersistence() : Object {

    return {
      code: {
        '#array': this.text.toPersistence(),
      },
    };
  }
}
