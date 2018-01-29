import * as Immutable from 'immutable';
import { augment } from '../common';
import { InlineContent } from '../common/inline';
import { Maybe } from 'tsmonad';

export type TranslationParams = {
  content?: InlineContent,
  id?: Maybe<string>,
  title?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Translation',
  content: new InlineContent(),
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  guid: '',
};

export class Translation extends Immutable.Record(defaultContent) {

  contentType: 'Translation';
  content: InlineContent;
  id: Maybe<string>;
  title: Maybe<string>;
  guid: string;

  constructor(params?: TranslationParams) {
    super(augment(params));
  }

  with(values: TranslationParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Translation {

    const t = (root as any).translation;

    const id = t['@id'] !== undefined
      ? Maybe.just(t['@id'])
      : Maybe.nothing();

    const title = t['@title'] !== undefined
      ? Maybe.just(t['@title'])
      : Maybe.nothing();

    return new Translation({
      guid,
      content: InlineContent.fromPersistence(t, ''),
      id,
      title,
    });
  }

  toPersistence() : Object {
    const t = {
      translation: {
        '#array': this.content.toPersistence(),
      },
    };

    this.id.lift(id => t.translation['@id'] = id);
    this.title.lift(title => t.translation['@title'] = title);

    return t;
  }
}
