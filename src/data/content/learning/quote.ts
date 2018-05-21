import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, getChildren } from '../common';

import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';

export type QuoteParams = {
  text?: ContentElements,
  entry?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Quote',
  elementType: 'quote',
  text: new ContentElements().with({ supportedElements: Immutable.List(TEXT_ELEMENTS) }),
  entry: Maybe.nothing(),
  guid: '',
};

export class Quote extends Immutable.Record(defaultContent) {

  contentType: 'Quote';
  elementType: 'quote';
  text: ContentElements;
  entry: Maybe<string>;
  guid: string;

  constructor(params?: QuoteParams) {
    super(augment(params));
  }

  with(values: QuoteParams) {
    return this.merge(values) as this;
  }

  clone() : Quote {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Quote {

    const t = (root as any).quote;

    const text = ContentElements.fromPersistence(getChildren(t), '', TEXT_ELEMENTS);
    const entry = t['@entry'] === undefined
      ? Maybe.nothing()
      : Maybe.just(t['@entry']);

    return new Quote().with({ guid, text, entry });

  }

  toPersistence() : Object {

    const q = {
      quote: {},
    };

    this.entry.lift(e => q.quote['@entry'] = e);

    return q;
  }
}
