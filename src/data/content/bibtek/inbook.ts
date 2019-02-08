import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import * as c from './common';

export type InBookParams = {
  id?: string;
  authorEditor?: Immutable.Map<string, string>;
  title?: string;
  publisher?: string;
  year?: string;
  chapter?: Maybe<string>;
  pages?: Maybe<string>;
  volumeNumber?: Maybe<Immutable.Map<string, string>>;
  series?: Maybe<string>;
  bookType?: Maybe<string>;
  address?: Maybe<string>;
  edition?: Maybe<string>;
  note?: Maybe<string>;
  month?: Maybe<string>;
  key?: Maybe<string>;
  crossref?: Maybe<string>;
  guid?: string,
};

const defaultContent = {
  contentType: 'InBook',
  elementType: 'bib:inbook',
  id: '',
  authorEditor: c.makeAuthor(''),
  title: '',
  publisher: '',
  year: '',
  chatper: Maybe.nothing(),
  pages: Maybe.nothing(),
  volumeNumber: Maybe.nothing(),
  bookType: Maybe.nothing(),
  series: Maybe.nothing(),
  address: Maybe.nothing(),
  edition: Maybe.nothing(),
  note: Maybe.nothing(),
  month: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class InBook extends Immutable.Record(defaultContent) {

  contentType: 'InBook';
  elementType: 'bib:inbook';
  id: string;
  authorEditor: Immutable.Map<string, string>;
  title: string;
  publisher: string;
  year: string;
  chapter: Maybe<string>;
  pages: Maybe<string>;
  volumeNumber: Maybe<Immutable.Map<string, string>>;
  bookType: Maybe<string>;
  series: Maybe<string>;
  address: Maybe<string>;
  edition: Maybe<string>;
  note: Maybe<string>;
  month: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: InBookParams) {
    super(augment(params));
  }

  with(values: InBookParams) {
    return this.merge(values) as this;
  }

  clone(): InBook {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): InBook {

    const wb = c.indexText((root as any)['bib:inbook']);

    let model = new InBook({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ authorEditor: c.makeAuthor(wb['@author']) });
    }
    if (wb['@editor'] !== undefined) {
      model = model.with({ authorEditor: c.makeEditor(wb['@editor']) });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@publisher'] !== undefined) {
      model = model.with({ publisher: wb['@publisher'] });
    }
    if (wb['@year'] !== undefined) {
      model = model.with({ year: wb['@year'] });
    }
    if (wb['@volume'] !== undefined) {
      model = model.with({ volumeNumber: Maybe.just(c.makeVolume(wb['@volume'])) });
    }
    if (wb['@number'] !== undefined) {
      model = model.with({ volumeNumber: Maybe.just(c.makeNumber(wb['@number'])) });
    }
    if (wb['@series'] !== undefined) {
      model = model.with({ series: Maybe.just(wb['@series']) });
    }
    if (wb['@address'] !== undefined) {
      model = model.with({ address: Maybe.just(wb['@address']) });
    }
    if (wb['@note'] !== undefined) {
      model = model.with({ note: Maybe.just(wb['@note']) });
    }
    if (wb['@edition'] !== undefined) {
      model = model.with({ edition: Maybe.just(wb['@edition']) });
    }
    if (wb['@month'] !== undefined) {
      model = model.with({ month: Maybe.just(wb['@month']) });
    }
    if (wb['@chapter'] !== undefined) {
      model = model.with({ chapter: Maybe.just(wb['@chapter']) });
    }
    if (wb['@pages'] !== undefined) {
      model = model.with({ pages: Maybe.just(wb['@pages']) });
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
      'bib:book': {},
    };
    const b = a['bib:book'];

    if (this.authorEditor.has('author')) {
      b['@author'] = this.authorEditor.get('author');
    } else {
      b['@editor'] = this.authorEditor.get('editor');
    }

    b['@title'] = this.title;
    b['@publisher'] = this.publisher;
    b['@year'] = this.year;

    this.volumeNumber.lift((v) => {
      if (v.has('number')) {
        b['@number'] = v.get('number');
      } else {
        b['@volume'] = v.get('volume');
      }
    });

    this.chapter.caseOf({
      just: (c) => {
        this.pages.caseOf({
          just: (p) => {
            b['@pages'] = p;
            b['@chapter'] = c;
          },
          nothing: () => {
            b['@chapter'] = c;
          },
        });
      },
      nothing: () => {
        this.pages.caseOf({
          just: (p) => {
            b['@pages'] = p;
          },
          nothing: () => {
            b['@pages'] = '';
          },
        });
      },
    });


    this.series.lift(v => b['@series'] = v);
    this.address.lift(v => b['@address'] = v);
    this.edition.lift(v => b['@edition'] = v);
    this.month.lift(v => b['@month'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return c.toElements(a, 'bib:inbook');
  }
}
