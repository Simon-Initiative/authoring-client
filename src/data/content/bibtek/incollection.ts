import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import * as c from './common';


export type InCollectionParams = {
  id?: string,
  author?: string,
  title?: string,
  booktitle?: string,
  publisher?: string,
  year?: string,
  editor?: Maybe<string>,
  volumeNumber?: Maybe<Immutable.Map<string, string>>,
  collectionType?: Maybe<string>,
  series?: Maybe<string>,
  chapter?: Maybe<string>,
  pages?: Maybe<string>,
  address?: Maybe<string>,
  edition?: Maybe<string>,
  note?: Maybe<string>,
  month?: Maybe<string>,
  key?: Maybe<string>,
  crossref?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'InCollection',
  elementType: 'bib:incollection',
  id: '',
  author: '',
  title: '',
  booktitle: '',
  publisher: '',
  year: '',
  editor: Maybe.nothing(),
  volumeNumber: Maybe.nothing(),
  collectionType: Maybe.nothing(),
  series: Maybe.nothing(),
  chapter: Maybe.nothing(),
  pages: Maybe.nothing(),
  address: Maybe.nothing(),
  edition: Maybe.nothing(),
  note: Maybe.nothing(),
  month: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class InCollection extends Immutable.Record(defaultContent) {

  contentType: 'InCollection';
  elementType: 'bib:incollection';
  id: string;
  author: string;
  title: string;
  booktitle: string;
  publisher: string;
  year: string;
  editor: Maybe<string>;
  volumeNumber: Maybe<Immutable.Map<string, string>>;
  collectionType: Maybe<string>;
  series: Maybe<string>;
  chapter: Maybe<string>;
  pages: Maybe<string>;
  address: Maybe<string>;
  edition: Maybe<string>;
  note: Maybe<string>;
  month: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: InCollectionParams) {
    super(augment(params));
  }

  with(values: InCollectionParams) {
    return this.merge(values) as this;
  }

  clone(): InCollection {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): InCollection {

    const wb = c.indexText((root as any)['bib:incollection']);

    let model = new InCollection({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: wb['@author'] });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@booktitle'] !== undefined) {
      model = model.with({ booktitle: wb['@booktitle'] });
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
    if (wb['@type'] !== undefined) {
      model = model.with({ collectionType: Maybe.just(wb['@type']) });
    }
    if (wb['@editor'] !== undefined) {
      model = model.with({ editor: Maybe.just(wb['@editor']) });
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
      'bib:incollection': {
        '@author': this.author,
        '@title': this.title,
        '@booktitle': this.booktitle,
        '@publisher': this.publisher,
        '@year': this.year,
      },
    };
    const b = a['bib:incollection'];

    this.volumeNumber.lift((v) => {
      if (v.has('number')) {
        b['@number'] = v.get('number');
      } else {
        b['@volume'] = v.get('volume');
      }
    });

    this.editor.lift(v => b['@editor'] = v);
    this.collectionType.lift(v => b['@type'] = v);
    this.series.lift(v => b['@series'] = v);
    this.chapter.lift(v => b['@chapter'] = v);
    this.pages.lift(v => b['@pages'] = v);
    this.address.lift(v => b['@address'] = v);
    this.edition.lift(v => b['@edition'] = v);
    this.month.lift(v => b['@month'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return c.toElements(a, 'bib:incollection');
  }
}
