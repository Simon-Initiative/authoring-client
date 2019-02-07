import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';

export type ManualParams = {
  id?: string,
  title?: string,
  author?: Maybe<string>,
  organization?: Maybe<string>,
  address?: Maybe<string>,
  edition?: Maybe<string>,
  month?: Maybe<string>,
  year?: Maybe<string>,
  note?: Maybe<string>,
  key?: Maybe<string>,
  crossref?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Manual',
  elementType: 'bib:Manual',
  id: '',
  author: Maybe.nothing(),
  title: '',
  organization: Maybe.nothing(),
  address: Maybe.nothing(),
  edition: Maybe.nothing(),
  month: Maybe.nothing(),
  year: Maybe.nothing(),
  note: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Manual extends Immutable.Record(defaultContent) {

  contentType: 'Manual';
  elementType: 'bib:manual';
  id: string;
  title: string;
  author: Maybe<string>;
  organization: Maybe<string>;
  address: Maybe<string>;
  edition: Maybe<string>;
  month: Maybe<string>;
  year: Maybe<string>;
  note: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: ManualParams) {
    super(augment(params));
  }

  with(values: ManualParams) {
    return this.merge(values) as this;
  }

  clone(): Manual {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Manual {

    const wb = (root as any)['bib:manual'];

    let model = new Manual({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: Maybe.just(wb['@author']) });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@organization'] !== undefined) {
      model = model.with({ organization: wb['@organization'] });
    }
    if (wb['@address'] !== undefined) {
      model = model.with({ address: Maybe.just(wb['@address']) });
    }
    if (wb['@edition'] !== undefined) {
      model = model.with({ edition: Maybe.just(wb['@edition']) });
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
      'bib:manual': {
        '@title': this.title,
      },
    };
    const b = a['bib:manual'];
    this.author.lift(v => b['@author'] = v);
    this.organization.lift(v => b['@organization'] = v);
    this.address.lift(v => b['@address'] = v);
    this.edition.lift(v => b['@edition'] = v);
    this.month.lift(v => b['@month'] = v);
    this.year.lift(v => b['@year'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return a;
  }
}
