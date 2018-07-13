import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';

export type CiteParams = {
  title?: string,
  id?: string,
  entry?: string,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Cite',
  elementType: 'cite',
  title: '',
  id: createGuid(),
  entry: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(TEXT_ELEMENTS) }),
  guid: '',
};

export class Cite extends Immutable.Record(defaultContent) {

  contentType: 'Cite';
  elementType: 'cite';
  title: string;
  id: string;
  entry: string;
  content: ContentElements;
  guid: string;

  constructor(params?: CiteParams) {
    super(augment(params));
  }

  with(values: CiteParams) {
    return this.merge(values) as this;
  }


  clone() : Cite {
    return this.with({
      content: this.content.clone(),
      id: createGuid(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Cite {

    const t = (root as any).cite;

    let model = new Cite().with({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@id']) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
    if (t['@entry'] !== undefined) {
      model = model.with({ entry: t['@entry'] === '' ? ' ' : t['@entry'] });
    }

    if (!Object.keys(t).every(k => k.startsWith('@'))) {
      model = model.with({ content: ContentElements
        .fromPersistence(except(getChildren(t), 'title'), '', TEXT_ELEMENTS) });
    }

    return model;
  }

  toPersistence() : Object {
    const o = {
      cite: {
        '@title': this.title,
        '@id': this.id,
      },
    };

    if (this.entry.trim() !== '') {
      o['@entry'] = this.entry;
    }

    return o;
  }
}
