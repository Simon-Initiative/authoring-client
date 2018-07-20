import * as Immutable from 'immutable';
import { augment, getChildren, ensureIdGuidPresent } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';

export type TitleParams = {
  text?: ContentElements
  guid?: string,
};

const defaultContent = {
  contentType: 'Title',
  elementType: 'title',
  text: ContentElements.fromText('', '', TEXT_ELEMENTS),
  guid: '',
};

export class Title extends Immutable.Record(defaultContent) {

  contentType: 'Title';
  elementType: 'title';
  text: ContentElements;
  guid: string;

  constructor(params?: TitleParams) {
    super(augment(params));
  }

  with(values: TitleParams) {
    return this.merge(values) as this;
  }

  clone() : Title {
    return ensureIdGuidPresent(this.with({
      text: this.text.clone(),
    }));
  }

  static fromText(str: string) : Title {
    const text = ContentElements.fromText(str, '', TEXT_ELEMENTS);
    return new Title({ text });
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Title {

    // Handle the case where there is a completely empty title object
    const t = Object.keys((root as any).title).length > 0
      ? (root as any).title
      : { '#text': '' };

    const text = ContentElements.fromPersistence(getChildren(t), '', TEXT_ELEMENTS, null, notify);
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
