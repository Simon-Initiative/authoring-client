import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';

import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';

export type TitleParams = {
  text?: ContentElements
  guid?: string,
};

const defaultContent = {
  contentType: 'Title',
  text: ContentElements.fromText('', '', TEXT_ELEMENTS),
  guid: '',
};

export class Title extends Immutable.Record(defaultContent) {

  contentType: 'Title';
  text: ContentElements;
  guid: string;

  constructor(params?: TitleParams) {
    super(augment(params));
  }

  with(values: TitleParams) {
    return this.merge(values) as this;
  }

  clone() : Title {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromText(str: string) : Title {
    const text = ContentElements.fromText(str, '', TEXT_ELEMENTS);
    return new Title({ text });
  }

  static fromPersistence(root: Object, guid: string) : Title {

    const t = (root as any).title;

    const text = ContentElements.fromPersistence(getChildren(t), '', TEXT_ELEMENTS);
    return new Title({ guid, text });

  }

  toPersistence() : Object {

    return {
      title: {
        '#text': this.text.extractPlainText().caseOf({
          just: s => s,
          nothing: () => '',
        }),
      },
    };
  }
}
