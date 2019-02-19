import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import { indexText, toElements } from './common';

export type MastersThesisParams = {
  id?: string;
  author?: string;
  title?: string;
  school?: string;
  year?: string;
  thesisType?: Maybe<string>;
  address?: Maybe<string>;
  month?: Maybe<string>;
  note?: Maybe<string>;
  key?: Maybe<string>;
  crossref?: Maybe<string>;
  guid?: string,
};

const defaultContent = {
  contentType: 'MastersThesis',
  elementType: 'bib:mastersthesis',
  id: '',
  author: '',
  title: '',
  school: '',
  year: '',
  thesisType: Maybe.nothing(),
  address: Maybe.nothing(),
  month: Maybe.nothing(),
  note: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class MastersThesis extends Immutable.Record(defaultContent) {

  contentType: 'MastersThesis';
  elementType: 'bib:masterstheis';
  id: string;
  author: string;
  title: string;
  school: string;
  year: string;
  thesisType: Maybe<string>;
  address: Maybe<string>;
  month: Maybe<string>;
  note: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: MastersThesisParams) {
    super(augment(params));
  }

  with(values: MastersThesisParams) {
    return this.merge(values) as this;
  }

  clone(): MastersThesis {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): MastersThesis {

    const wb = indexText((root as any)['bib:mastersthesis']);

    let model = new MastersThesis({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: wb['@author'] });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@school'] !== undefined) {
      model = model.with({ school: wb['@school'] });
    }
    if (wb['@year'] !== undefined) {
      model = model.with({ year: wb['@year'] });
    }
    if (wb['@type'] !== undefined) {
      model = model.with({ thesisType: Maybe.just(wb['@type']) });
    }
    if (wb['@address'] !== undefined) {
      model = model.with({ address: Maybe.just(wb['@address']) });
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
      'bib:mastersthesis': {
        '@author': this.author,
        '@title': this.title,
        '@school': this.school,
        '@year': this.year,
      },
    };
    const b = a['bib:mastersthesis'];
    this.thesisType.lift(v => b['@type'] = v);
    this.address.lift(v => b['@address'] = v);
    this.month.lift(v => b['@month'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return toElements(a, 'bib:mastersthesis');
  }
}
