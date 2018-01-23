import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { Text } from './text';

export type QuoteParams = {
  text?: Text,
  entry?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Quote',
  text: new Text(),
  entry: Maybe.nothing(),
  guid: '',
};

export class Quote extends Immutable.Record(defaultContent) {

  contentType: 'Quote';
  text: Text;
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

    const text = new Text().with({ content: getChildren(t) });
    const entry = t['@entry'] === undefined
      ? Maybe.nothing()
      : Maybe.just(t['@entry']);

    return new Quote().with({ guid, text, entry });

  }

  toPersistence() : Object {

    const q = {
      quote: {
        '#array': this.text.toPersistence(),
      },
    };

    this.entry.lift(e => q.quote['@entry'] = e);

    return q;
  }
}
