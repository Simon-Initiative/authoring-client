import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { InlineContent } from '../types/inline';

export type CaptionParams = {
  content?: InlineContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Caption',
  content: new InlineContent(),
  guid: '',
};

export class Caption extends Immutable.Record(defaultContent) {

  contentType: 'Caption';
  content: InlineContent;
  guid: string;

  constructor(params?: CaptionParams) {
    super(augment(params));
  }

  with(values: CaptionParams) {
    return this.merge(values) as this;
  }

  clone() : Caption {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Caption {

    const t = (root as any).caption;

    let model = new Caption({ guid });
    model = model.with({ content: InlineContent.fromPersistence(getChildren(t), '') });

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
