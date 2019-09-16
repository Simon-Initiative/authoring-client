import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except, ensureIdGuidPresent, setId } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';

export type CiteParams = {
  title?: string,
  id?: string,
  entry?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Cite',
  elementType: 'cite',
  title: '',
  id: '',
  entry: '',
  guid: '',
};

export class Cite extends Immutable.Record(defaultContent) {

  contentType: 'Cite';
  elementType: 'cite';
  title: string;
  id: string;
  entry: string;
  guid: string;

  constructor(params?: CiteParams) {
    super(augment(params, true));
  }

  with(values: CiteParams) {
    return this.merge(values) as this;
  }


  clone(): Cite {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Cite {

    const t = (root as any).cite;

    let model = new Cite().with({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    model = setId(model, t, notify);
    if (t['@entry'] !== undefined) {
      model = model.with({ entry: t['@entry'] === '' ? ' ' : t['@entry'] });
    }

    return model;
  }

  toPersistence(): Object {
    const o = {
      cite: {
        '@title': this.title,
        '@id': this.id ? this.id : createGuid(),
      },
    };

    if (this.entry.trim() !== '') {
      o.cite['@entry'] = this.entry;
    }

    return o;
  }
}
