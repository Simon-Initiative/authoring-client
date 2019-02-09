import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { Maybe } from 'tsmonad';
import * as c from './common';


export type ProceedingsParams = {
  id?: string,
  title?: string,
  year?: string,
  editor?: Maybe<string>,
  volumeNumber?: Maybe<Immutable.Map<string, string>>,
  series?: Maybe<string>,
  publisher?: Maybe<string>,
  address?: Maybe<string>,
  organization?: Maybe<string>,
  note?: Maybe<string>,
  month?: Maybe<string>,
  key?: Maybe<string>,
  crossref?: Maybe<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Proceedings',
  elementType: 'bib:Proceedings',
  id: '',
  title: '',
  year: '',
  editor: Maybe.nothing(),
  volumeNumber: Maybe.nothing(),
  address: Maybe.nothing(),
  series: Maybe.nothing(),
  publisher: Maybe.nothing(),
  organization: Maybe.nothing(),
  note: Maybe.nothing(),
  month: Maybe.nothing(),
  key: Maybe.nothing(),
  crossref: Maybe.nothing(),
  guid: '',
};

export class Proceedings extends Immutable.Record(defaultContent) {

  contentType: 'Proceedings';
  elementType: 'bib:Proceedings';
  id: string;
  title: string;
  year: string;
  editor: Maybe<string>;
  volumeNumber: Maybe<Immutable.Map<string, string>>;
  series: Maybe<string>;
  publisher: Maybe<string>;
  address: Maybe<string>;
  organization: Maybe<string>;
  note: Maybe<string>;
  month: Maybe<string>;
  key: Maybe<string>;
  crossref: Maybe<string>;
  guid: string;

  constructor(params?: ProceedingsParams) {
    super(augment(params));
  }

  with(values: ProceedingsParams) {
    return this.merge(values) as this;
  }

  clone(): Proceedings {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Proceedings {

    const wb = c.indexText((root as any)['bib:proceedings']);

    let model = new Proceedings({ guid });

    if (wb['@title'] !== undefined) {
      model = model.with({ title: wb['@title'] });
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
    if (wb['@publisher'] !== undefined) {
      model = model.with({ publisher: Maybe.just(wb['@publisher']) });
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
      'bib:proceedings': {
      },
    };
    const b = a['bib:proceedings'];
    this.editor.lift(v => b['@editor'] = v);

    b['@title'] = this.title;
    b['@year'] = this.year;

    this.volumeNumber.lift((v) => {
      if (v.has('number')) {
        b['@number'] = v.get('number');
      } else {
        b['@volume'] = v.get('volume');
      }
    });

    this.series.lift(v => b['@series'] = v);
    this.address.lift(v => b['@address'] = v);
    this.month.lift(v => b['@month'] = v);
    this.organization.lift(v => b['@organization'] = v);
    this.publisher.lift(v => b['@publisher'] = v);
    this.note.lift(v => b['@note'] = v);
    this.key.lift(v => b['@key'] = v);
    this.crossref.lift(v => b['@crossref'] = v);

    return c.toElements(a, 'bib:proceedings');
  }
}
