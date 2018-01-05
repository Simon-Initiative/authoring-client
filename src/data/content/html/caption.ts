import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';

import { ContentState } from 'draft-js';
import { cloneContent } from '../common/clone';
import { toPersistence } from './topersistence';
import { toDraft } from './todraft';

const emptyContent = ContentState.createFromText('');

export type CaptionParams = {
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'Caption',
  content: emptyContent,
  guid: '',
};

export class Caption extends Immutable.Record(defaultContent) {

  contentType: 'Caption';
  content: ContentState;
  guid: string;

  constructor(params?: CaptionParams) {
    super(augment(params));
  }

  with(values: CaptionParams) {
    return this.merge(values) as this;
  }

  clone() : Caption {
    return this.with({
      content: cloneContent(this.content),
    });
  }

  static fromPersistence(root: Object, guid: string) : Caption {

    const t = (root as any).caption;

    let model = new Caption({ guid });
    model = model.with({ content: toDraft(getChildren(t)) });

    return model;
  }

  toPersistence() : Object {
    return {
      caption: {
        '#array': toPersistence(this.content, true),
      },
    };
  }
}
