import * as Immutable from 'immutable';
import { augment } from '../common';

import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';

export type PronunciationParams = {
  content?: ContentElements,
  id?: Maybe<string>,
  title?: Maybe<string>,
  src?: Maybe<string>,
  srcContentType?: Maybe<string>
  guid?: string,
};

const defaultContent = {
  contentType: 'Pronunciation',
  elementType: 'pronunciation',
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  src: Maybe.nothing(),
  srcContentType: Maybe.nothing(),
  guid: '',
};

export class Pronunciation extends Immutable.Record(defaultContent) {

  contentType: 'Pronunciation';
  elementType: 'pronunciation';
  content: ContentElements;
  id: Maybe<string>;
  title: Maybe<string>;
  src: Maybe<string>;
  srcContentType: Maybe<string>;
  guid: string;

  constructor(params?: PronunciationParams) {
    super(augment(params));
  }

  with(values: PronunciationParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Pronunciation {

    const t = (root as any).pronunciation;

    const id = t['@id'] !== undefined
      ? Maybe.just(t['@id'])
      : Maybe.nothing();

    const title = t['@title'] !== undefined
      ? Maybe.just(t['@title'])
      : Maybe.nothing();

    const src = t['@src'] !== undefined
      ? Maybe.just(t['@src'])
      : Maybe.nothing();

    const srcContentType = t['@type'] !== undefined
      ? Maybe.just(t['@type'])
      : Maybe.nothing();

    return new Pronunciation({
      guid,
      content: ContentElements.fromPersistence(t, '', INLINE_ELEMENTS),
      id,
      title,
      src,
      srcContentType,
    });
  }

  toPersistence() : Object {
    const t = {
      pronunciation: {
        '#array': this.content.toPersistence(),
      },
    };

    this.id.lift(id => t.pronunciation['@id'] = id);
    this.title.lift(title => t.pronunciation['@title'] = title);
    this.src.lift(src => t.pronunciation['@src'] = src);
    this.srcContentType.lift(ty => t.pronunciation['@type'] = ty);

    return t;
  }
}
