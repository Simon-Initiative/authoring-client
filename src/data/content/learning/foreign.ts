import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import { TEXT_ELEMENTS, ContentElements } from 'data/content/common/elements';
import { getChildren } from 'data/content/common';

type LocaleCodes = {
  [Code in LocaleCode]: string;
};

export type LocaleCode =
  | 'Default'
  | 'ar'
  | 'de'
  | 'en_GB'
  | 'en_US'
  | 'es'
  | 'es_419'
  | 'fr'
  | 'it'
  | 'ru'
  | 'zh_CN';

export const localeCodes: LocaleCodes = {
  Default: 'Default',
  ar: 'Arabic',
  de: 'German',
  en_GB: 'English (Great Britain)',
  en_US: 'English (USA)',
  es: 'Spanish (Spain)',
  es_419: 'Spanish (LATAM)',
  fr: 'French',
  it: 'Italian',
  ru: 'Russian',
  zh_CN: 'Chinese (Mandarin)',
};

export type ForeignParams = {
  lang?: Maybe<LocaleCode>;
  guid?: string;
  text?: ContentElements,
};

const defaultContent = {
  contentType: 'Foreign',
  elementType: 'foreign',
  lang: Maybe.nothing<LocaleCode>(),
  guid: '',
  text: new ContentElements().with({ supportedElements: Immutable.List(TEXT_ELEMENTS) }),
};


export class Foreign extends Immutable.Record(defaultContent) {

  contentType: 'Foreign';
  elementType: 'foreign';
  lang: Maybe<LocaleCode>;
  guid: string;
  text: ContentElements;

  constructor(params?: ForeignParams) {
    super(augment(params));
  }

  with(values: ForeignParams) {
    return this.merge(values) as this;
  }

  clone(): Foreign {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Foreign {

    const m = (root as any).foreign;
    const text = ContentElements.fromPersistence(getChildren(m), '', TEXT_ELEMENTS, null, notify);
    let model = new Foreign().with({ guid, text });

    if (m['@lang'] !== undefined) {
      model = model.with({ lang: Maybe.just(m['@lang']) });
    }

    return model;
  }

  toPersistence(): Object {

    const foreign = {
      foreign: {},
    };

    this.lang.lift(l => foreign.foreign['@lang'] = l);

    return foreign;
  }

}
