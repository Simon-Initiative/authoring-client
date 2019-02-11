import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import { indexText, toElements } from './common';

export type TechReportParams = {
  id?: string;
  author?: string;
  title?: string;
  institution?: string;
  year?: string;
  reportType?: Maybe<string>;
  number?: Maybe<string>;
  address?: Maybe<string>;
  month?: Maybe<string>;
  note?: Maybe<string>;
  key?: Maybe<string>;
  crossref?: Maybe<string>;
  guid?: string,
};

const defaultContent = {
  contentType: 'TechReport',
  elementType: 'bib:techreport',
  id: '',
  author: '',
  title: '',
  institution: '',
  year: '',
  reportType: Maybe.nothing(),
  number: Maybe.nothing(),
  address: Maybe.nothing(),
  month: Maybe.nothing(),
  note: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class TechReport extends Immutable.Record(defaultContent) {

  contentType: 'TechReport';
  elementType: 'bib:techreport';
  id: string;
  author: string;
  title: string;
  institution: string;
  year: string;
  reportType: Maybe<string>;
  number: Maybe<string>;
  address: Maybe<string>;
  month: Maybe<string>;
  note: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: TechReportParams) {
    super(augment(params));
  }

  with(values: TechReportParams) {
    return this.merge(values) as this;
  }

  clone(): TechReport {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): TechReport {

    const wb = indexText((root as any)['bib:techreport']);

    let model = new TechReport({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: wb['@author'] });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@institution'] !== undefined) {
      model = model.with({ institution: wb['@institution'] });
    }
    if (wb['@year'] !== undefined) {
      model = model.with({ year: wb['@year'] });
    }
    if (wb['@type'] !== undefined) {
      model = model.with({ reportType: Maybe.just(wb['@type']) });
    }
    if (wb['@number'] !== undefined) {
      model = model.with({ number: Maybe.just(wb['@number']) });
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
      'bib:techreport': {
        '@author': this.author,
        '@title': this.title,
        '@institution': this.institution,
        '@year': this.year,
      },
    };
    const b = a['bib:techreport'];
    this.reportType.lift(v => b['@type'] = v);
    this.number.lift(v => b['@number'] = v);
    this.address.lift(v => b['@address'] = v);
    this.month.lift(v => b['@month'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return toElements(a, 'bib:techreport');
  }
}
