import * as Immutable from 'immutable';
import { augment } from '../common';

import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';

export type InstructionsParams = {
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Instructions',
  elementType: 'instructions',
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class Instructions extends Immutable.Record(defaultContent) {

  contentType: 'Instructions';
  elementType: 'instructions';
  content: ContentElements;
  guid: string;

  constructor(params?: InstructionsParams) {
    super(augment(params));
  }

  with(values: InstructionsParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Instructions {

    const t = (root as any).instructions;

    return new Instructions({
      guid,
      content: ContentElements.fromPersistence(t, '', INLINE_ELEMENTS),
    });
  }

  toPersistence() : Object {
    const t = {
      instructions: {
        '#array': this.content.toPersistence(),
      },
    };

    return t;
  }
}
