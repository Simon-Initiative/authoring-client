import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { indexText, el } from './common';
import { Maybe } from 'tsmonad';


export type ArticleParams = {
  id?: string;
  author?: string;
  title?: string;
  journal?: string;
  year?: string;
  volume?: Maybe<string>;
  number?: Maybe<string>;
  pages?: Maybe<string>;
  month?: Maybe<string>;
  note?: Maybe<string>;
  key?: Maybe<string>;
  crossref?: Maybe<string>;
  guid?: string,
};

const defaultContent = {
  contentType: 'Article',
  elementType: 'bib:article',
  id: '',
  author: '',
  title: '',
  journal: '',
  year: '',
  volume: Maybe.nothing(),
  number: Maybe.nothing(),
  pages: Maybe.nothing(),
  month: Maybe.nothing(),
  note: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Article extends Immutable.Record(defaultContent) {

  contentType: 'Article';
  elementType: 'bib:article';
  id: string;
  author: string;
  title: string;
  journal: string;
  year: string;
  volume: Maybe<string>;
  number: Maybe<string>;
  pages: Maybe<string>;
  month: Maybe<string>;
  note: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: ArticleParams) {
    super(augment(params));
  }

  with(values: ArticleParams) {
    return this.merge(values) as this;
  }

  clone(): Article {
    return ensureIdGuidPresent(this);
  }



  static fromPersistence(root: Object, guid: string, notify: () => void): Article {

    const wb = indexText((root as any)['bib:article']);

    let model = new Article({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: wb['@author'] });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@journal'] !== undefined) {
      model = model.with({ journal: wb['@journal'] });
    }
    if (wb['@year'] !== undefined) {
      model = model.with({ year: wb['@year'] });
    }
    if (wb['@volume'] !== undefined) {
      model = model.with({ volume: Maybe.just(wb['@volume']) });
    }
    if (wb['@number'] !== undefined) {
      model = model.with({ number: Maybe.just(wb['@number']) });
    }
    if (wb['@pages'] !== undefined) {
      model = model.with({ pages: Maybe.just(wb['@pages']) });
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
    const c = [
      el('bib:author', this.author),
      el('bib:title', this.title),
      el('bib:journal', this.journal),
      el('bib:year', this.year),
    ];
    this.volume.lift(v => c.push(el('bib:volume', v)));
    this.number.lift(v => c.push(el('bib:number', v)));
    this.pages.lift(v => c.push(el('bib:pages', v)));
    this.month.lift(v => c.push(el('bib:month', v)));
    this.note.lift(v => c.push(el('bib:note', v)));
    this.key.lift(v => c.push(el('bib:key', v)));
    this.crossref.lift(v => c.push(el('bib:crossref', v)));

    return {
      'bib:article': {
        '#array': c,
      },
    };
  }
}
