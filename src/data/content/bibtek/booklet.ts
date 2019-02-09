import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { indexText, toElements } from './common';
import { Maybe } from 'tsmonad';

export type BookletParams = {
  id?: string;
  author?: string;
  title?: string;
  howPublished?: Maybe<string>;
  address?: Maybe<string>;
  year?: Maybe<string>;
  month?: Maybe<string>;
  note?: Maybe<string>;
  key?: Maybe<string>;
  crossref?: Maybe<string>;
  guid?: string,
};

const defaultContent = {
  contentType: 'Booklet',
  elementType: 'bib:booklet',
  id: '',
  author: '',
  title: '',
  howPublished: Maybe.nothing(),
  address: Maybe.nothing(),
  year: Maybe.nothing(),
  month: Maybe.nothing(),
  note: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Booklet extends Immutable.Record(defaultContent) {

  contentType: 'Booklet';
  elementType: 'bib:booklet';
  id: string;
  author: string;
  title: string;
  howPublished: Maybe<string>;
  address: Maybe<string>;
  year: Maybe<string>;
  month: Maybe<string>;
  note: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: BookletParams) {
    super(augment(params));
  }

  with(values: BookletParams) {
    return this.merge(values) as this;
  }

  clone(): Booklet {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Booklet {

    const wb = indexText((root as any)['bib:booklet']);

    let model = new Booklet({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: wb['@author'] });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@howpublished'] !== undefined) {
      model = model.with({ howPublished: Maybe.just(wb['@howpublished']) });
    }
    if (wb['@address'] !== undefined) {
      model = model.with({ address: Maybe.just(wb['@address']) });
    }
    if (wb['@year'] !== undefined) {
      model = model.with({ year: Maybe.just(wb['@year']) });
    }
    if (wb['@month'] !== undefined) {
      model = model.with({ month: Maybe.just(wb['@month']) });
    }
    if (wb['@note'] !== undefined) {
      model = model.with({ note: Maybe.just(wb['@note']) });
    }
    if (wb['@key'] !== undefined) {
      model = model.with({ key: Maybe.just(wb['@key']) });
    }
    if (wb['@crossref'] !== undefined) {
      model = model.with({ crossref: Maybe.just(wb['@crossref']) });
    }


    return model;
  }

  toPersistence(): Object {
    const a = {
      'bib:booklet': {
        '@author': this.author,
        '@title': this.title,
      },
    };
    const b = a['bib:booklet'];
    this.howPublished.lift(v => b['@howpublished'] = v);
    this.address.lift(v => b['@address'] = v);
    this.month.lift(v => b['@month'] = v);
    this.year.lift(v => b['@year'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return toElements(a, 'bib:booklet');
  }
}
