import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';

export type MiscParams = {
  id?: string,
  title?: Maybe<string>,
  author?: Maybe<string>,
  howPublished?: Maybe<string>,
  month?: Maybe<string>,
  year?: Maybe<string>,
  note?: Maybe<string>,
  key?: Maybe<string>,
  crossref?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Misc',
  elementType: 'bib:misc',
  id: '',
  author: Maybe.nothing(),
  title: Maybe.nothing(),
  howPublished: Maybe.nothing(),
  month: Maybe.nothing(),
  year: Maybe.nothing(),
  note: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Misc extends Immutable.Record(defaultContent) {

  contentType: 'Misc';
  elementType: 'bib:misc';
  id: string;
  title: Maybe<string>;
  author: Maybe<string>;
  howPublished: Maybe<string>;
  month: Maybe<string>;
  year: Maybe<string>;
  note: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: MiscParams) {
    super(augment(params));
  }

  with(values: MiscParams) {
    return this.merge(values) as this;
  }

  clone(): Misc {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Misc {

    const wb = (root as any)['bib:misc'];

    let model = new Misc({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: Maybe.just(wb['@author']) });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@howpublished'] !== undefined) {
      model = model.with({ howPublished: Maybe.just(wb['@howPublished']) });
    }
    if (wb['@month'] !== undefined) {
      model = model.with({ month: Maybe.just(wb['@month']) });
    }
    if (wb['@year'] !== undefined) {
      model = model.with({ year: Maybe.just(wb['@year']) });
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
      'bib:misc': {},
    };
    const b = a['bib:misc'];
    this.author.lift(v => b['@author'] = v);
    this.title.lift(v => b['@title'] = v);
    this.howPublished.lift(v => b['@howpublished'] = v);
    this.month.lift(v => b['@month'] = v);
    this.year.lift(v => b['@year'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return a;
  }
}
