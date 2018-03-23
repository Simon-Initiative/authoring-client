import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, getChildren } from '../common';

import { ContiguousText, ContigiousTextMode } from 'data/content/learning/contiguous';

export type BlockQuoteParams = {
  text?: ContiguousText,
  entry?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'BlockQuote',
  text: ContiguousText.fromText('', '').with({ mode: ContigiousTextMode.SimpleText }),
  entry: Maybe.nothing(),
  guid: '',
};

export class BlockQuote extends Immutable.Record(defaultContent) {

  contentType: 'BlockQuote';
  text: ContiguousText;
  entry: Maybe<string>;
  guid: string;

  constructor(params?: BlockQuoteParams) {
    super(augment(params));
  }

  with(values: BlockQuoteParams) {
    return this.merge(values) as this;
  }

  clone() : BlockQuote {
    return this.with({
      text: this.text.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : BlockQuote {

    const t = (root as any).quote;

    const text = ContiguousText.fromPersistence(getChildren(t), '')
      .with({ mode: ContigiousTextMode.SimpleText });
    const entry = t['@entry'] === undefined
      ? Maybe.nothing()
      : Maybe.just(t['@entry']);

    return new BlockQuote().with({ guid, text, entry });

  }

  toPersistence() : Object {

    const q = {
      quote: {},
    };

    this.entry.lift(e => q.quote['@entry'] = e);

    return q;
  }
}
