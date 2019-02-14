import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import { indexText, toElements } from './common';

export type UnpublishedParams = {
  id?: string;
  author?: string;
  title?: string;
  note?: string;
  year?: Maybe<string>;
  month?: Maybe<string>;
  key?: Maybe<string>;
  crossref?: Maybe<string>;
  guid?: string,
};

const defaultContent = {
  contentType: 'Unpublished',
  elementType: 'bib:unpublished',
  id: '',
  author: '',
  title: '',
  note: '',
  month: Maybe.nothing(),
  year: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Unpublished extends Immutable.Record(defaultContent) {

  contentType: 'Unpublished';
  elementType: 'bib:unpublished';
  id: string;
  author: string;
  title: string;
  note: string;
  month: Maybe<string>;
  year: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: UnpublishedParams) {
    super(augment(params));
  }

  with(values: UnpublishedParams) {
    return this.merge(values) as this;
  }

  clone(): Unpublished {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Unpublished {

    const wb = indexText((root as any)['bib:unpublished']);

    let model = new Unpublished({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: wb['@author'] });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@note'] !== undefined) {
      model = model.with({ note: wb['@note'] });
    }
    if (wb['@month'] !== undefined) {
      model = model.with({ month: Maybe.just(wb['@month']) });
    }
    if (wb['@year'] !== undefined) {
      model = model.with({ year: Maybe.just(wb['@year']) });
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
      'bib:unpublished': {
        '@author': this.author,
        '@title': this.title,
        '@note': this.note,
      },
    };
    const b = a['bib:unpublished'];
    this.month.lift(v => b['@month'] = v);
    this.year.lift(v => b['@year'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return toElements(a, 'bib:unpublished');
  }
}
