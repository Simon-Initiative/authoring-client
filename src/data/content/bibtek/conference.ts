import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import * as c from './common';


export type ConferenceParams = {
  id?: string,
  author?: string,
  title?: string,
  booktitle?: string,
  year?: string,
  editor?: Maybe<string>,
  volumeNumber?: Maybe<c.VolumeOrNumber>,
  series?: Maybe<string>,
  pages?: Maybe<string>,
  address?: Maybe<string>,
  organization?: Maybe<string>,
  note?: Maybe<string>,
  month?: Maybe<string>,
  key?: Maybe<string>,
  crossref?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Conference',
  elementType: 'bib:conference',
  id: '',
  author: '',
  title: '',
  booktitle: '',
  year: '',
  editor: Maybe.nothing(),
  volumeNumber: Maybe.nothing(),
  series: Maybe.nothing(),
  pages: Maybe.nothing(),
  organization: Maybe.nothing(),
  edition: Maybe.nothing(),
  note: Maybe.nothing(),
  month: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Conference extends Immutable.Record(defaultContent) {

  contentType: 'Conference';
  elementType: 'bib:conference';
  id: string;
  author: string;
  title: string;
  booktitle: string;
  year: string;
  editor: Maybe<string>;
  volumeNumber: Maybe<c.VolumeOrNumber>;
  series: Maybe<string>;
  pages: Maybe<string>;
  address: Maybe<string>;
  organization: Maybe<string>;
  note: Maybe<string>;
  month: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: ConferenceParams) {
    super(augment(params));
  }

  with(values: ConferenceParams) {
    return this.merge(values) as this;
  }

  clone(): Conference {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Conference {

    const wb = (root as any)['bib:conference'];

    let model = new Conference({ guid });

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
      'bib:conference': {
        '@author': this.author,
        '@title': this.title,
        '@booktitle': this.booktitle,
        '@year': this.year,
      },
    };
    const b = a['bib:conference'];

    this.volumeNumber.lift((v) => {
      if (v.type === 'number') {
        b['@number'] = v;
      } else {
        b['@volume'] = v;
      }
    });

    this.editor.lift(v => b['@editor'] = v);
    this.organization.lift(v => b['@organization'] = v);
    this.series.lift(v => b['@series'] = v);
    this.pages.lift(v => b['@pages'] = v);
    this.address.lift(v => b['@address'] = v);
    this.month.lift(v => b['@month'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return a;
  }
}
