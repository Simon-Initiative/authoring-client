import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import * as c from './common';

export type BookParams = {
  id?: string;
  authorEditor?: c.AuthorOrEditor;
  title?: string;
  publisher?: string;
  year?: string;
  volumeNumber?: Maybe<c.VolumeOrNumber>;
  series?: Maybe<string>;
  address?: Maybe<string>;
  edition?: Maybe<string>;
  note?: Maybe<string>;
  month?: Maybe<string>;
  key?: Maybe<string>;
  crossref?: Maybe<string>;
  guid?: string,
};

const defaultContent = {
  contentType: 'Book',
  elementType: 'bib:book',
  id: '',
  authorEditor: c.makeAuthor(''),
  title: '',
  publisher: '',
  year: '',
  volumeNumber: Maybe.nothing(),
  series: Maybe.nothing(),
  address: Maybe.nothing(),
  edition: Maybe.nothing(),
  note: Maybe.nothing(),
  month: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Book extends Immutable.Record(defaultContent) {

  contentType: 'Book';
  elementType: 'bib:book';
  id: string;
  authorEditor: c.AuthorOrEditor;
  title: string;
  publisher: string;
  year: string;
  volumeNumber: Maybe<c.VolumeOrNumber>;
  series: Maybe<string>;
  address: Maybe<string>;
  edition: Maybe<string>;
  note: Maybe<string>;
  month: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: BookParams) {
    super(augment(params));
  }

  with(values: BookParams) {
    return this.merge(values) as this;
  }

  clone(): Book {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Book {

    const wb = c.indexText((root as any)['bib:book']);

    let model = new Book({ guid });

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
      'bib:book': {
        '@title': this.title,
        '@publisher': this.publisher,
        '@year': this.year,
      },
    };
    const b = a['bib:book'];

    if (this.authorEditor.type === 'author') {
      b['@author'] = this.authorEditor.author;
    } else {
      b['@editor'] = this.authorEditor.editor;
    }
    this.volumeNumber.lift((v) => {
      if (v.type === 'number') {
        b['@number'] = v;
      } else {
        b['@volume'] = v;
      }
    });
    this.series.lift(v => b['@series'] = v);
    this.address.lift(v => b['@address'] = v);
    this.edition.lift(v => b['@edition'] = v);
    this.month.lift(v => b['@month'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return c.toElements(a, 'bib:book');
  }
}
