import * as Immutable from 'immutable';
import { augment, getChildren, ensureIdGuidPresent } from '../common';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';

export type CaptionParams = {
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Caption',
  elementType: 'caption',
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  guid: '',
};

export class Caption extends Immutable.Record(defaultContent) {

  contentType: 'Caption';
  elementType: 'caption';
  content: ContentElements;
  guid: string;

  constructor(params?: CaptionParams) {
    super(augment(params));
  }

  with(values: CaptionParams) {
    return this.merge(values) as this;
  }

  clone() : Caption {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Caption {

    const t = (root as any).caption;

    let model = new Caption({ guid });
    model = model.with({ content: ContentElements
      .fromPersistence(getChildren(t), '', INLINE_ELEMENTS, null, notify) });

    return model;
  }

  toPersistence() : Object {
    return {
      caption: {
        '#array': this.content.toPersistence(),
      },
    };
  }
}
