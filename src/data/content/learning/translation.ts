import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import createGuid from 'utils/guid';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';

export type TranslationParams = {
  content?: ContentElements,
  id?: string,
  title?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Translation',
  elementType: 'translation',
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
  id: '',
  title: Maybe.nothing(),
  guid: '',
};

export class Translation extends Immutable.Record(defaultContent) {

  contentType: 'Translation';
  elementType: 'translation';
  content: ContentElements;
  id: string;
  title: Maybe<string>;
  guid: string;

  constructor(params?: TranslationParams) {
    super(augment(params, true));
  }

  with(values: TranslationParams) {
    return this.merge(values) as this;
  }

  clone(): Translation {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Translation {

    const t = (root as any).translation;

    const id = t['@id']
      ? t['@id']
      : notify() || createGuid();

    const title = t['@title'] !== undefined
      ? Maybe.just(t['@title'])
      : Maybe.nothing();

    return new Translation({
      guid,
      content: ContentElements.fromPersistence(t, '', INLINE_ELEMENTS, null, notify),
      id,
      title,
    });
  }

  toPersistence() : Object {
    const t = {
      translation: {
        '@id': this.id ? this.id : createGuid(),
        '#array': this.content.toPersistence(),
      },
    };

    this.title.lift(title => t.translation['@title'] = title);

    return t;
  }
}
