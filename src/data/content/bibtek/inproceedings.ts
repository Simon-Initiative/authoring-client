import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import * as c from './common';


export type InProceedingsParams = {
  id?: string,
  author?: string,
  title?: string,
  booktitle?: string,
  year?: string,
  editor?: Maybe<string>,
  volumeNumber?: Maybe<Immutable.Map<string, string>>,
  series?: Maybe<string>,
  pages?: Maybe<string>,
  address?: Maybe<string>,
  organization?: Maybe<string>,
  publisher?: Maybe<string>,
  note?: Maybe<string>,
  month?: Maybe<string>,
  key?: Maybe<string>,
  crossref?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'InProceedings',
  elementType: 'bib:inproceedings',
  id: '',
  author: '',
  title: '',
  booktitle: '',
  year: '',
  editor: Maybe.nothing(),
  address: Maybe.nothing(),
  volumeNumber: Maybe.nothing(),
  series: Maybe.nothing(),
  pages: Maybe.nothing(),
  organization: Maybe.nothing(),
  publisher: Maybe.nothing(),
  note: Maybe.nothing(),
  month: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class InProceedings extends Immutable.Record(defaultContent) {

  contentType: 'InProceedings';
  elementType: 'bib:inproceedings';
  id: string;
  author: string;
  title: string;
  booktitle: string;
  year: string;
  editor: Maybe<string>;
  volumeNumber: Maybe<Immutable.Map<string, string>>;
  series: Maybe<string>;
  pages: Maybe<string>;
  address: Maybe<string>;
  organization: Maybe<string>;
  publisher: Maybe<string>;
  note: Maybe<string>;
  month: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: InProceedingsParams) {
    super(augment(params));
  }

  with(values: InProceedingsParams) {
    return this.merge(values) as this;
  }

  clone(): InProceedings {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): InProceedings {

    const wb = c.indexText((root as any)['bib:inproceedings']);

    let model = new InProceedings({ guid });

    if (wb['@author'] !== undefined) {
      model = model.with({ author: wb['@author'] });
    }
    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
    }
    if (wb['@booktitle'] !== undefined) {
      model = model.with({ booktitle: wb['@booktitle'] });
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
    if (wb['@editor'] !== undefined) {
      model = model.with({ editor: Maybe.just(wb['@editor']) });
    }
    if (wb['@address'] !== undefined) {
      model = model.with({ address: Maybe.just(wb['@address']) });
    }
    if (wb['@pages'] !== undefined) {
      model = model.with({ pages: Maybe.just(wb['@pages']) });
    }
    if (wb['@organization'] !== undefined) {
      model = model.with({ organization: Maybe.just(wb['@organization']) });
    }
    if (wb['@publisher'] !== undefined) {
      model = model.with({ publisher: Maybe.just(wb['@publisher']) });
    }
    if (wb['@note'] !== undefined) {
      model = model.with({ note: Maybe.just(wb['@note']) });
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
      'bib:inproceedings': {
        '@author': this.author,
        '@title': this.title,
        '@booktitle': this.booktitle,
        '@year': this.year,
      },
    };
    const b = a['bib:inproceedings'];
    this.editor.lift(v => b['@editor'] = v);

    this.volumeNumber.lift((v) => {
      if (v.has('number')) {
        b['@number'] = v.get('number');
      } else {
        b['@volume'] = v.get('volume');
      }
    });

    this.series.lift(v => b['@series'] = v);
    this.pages.lift(v => b['@pages'] = v);
    this.address.lift(v => b['@address'] = v);
    this.month.lift(v => b['@month'] = v);
    this.organization.lift(v => b['@organization'] = v);
    this.publisher.lift(v => b['@publisher'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return c.toElements(a, 'bib:inproceedings');
  }
}
