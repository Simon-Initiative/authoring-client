import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');

export type CiteParams = {
  title?: string,
  id?: string,
  entry?: string,
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'Cite',
  title: '',
  id: '',
  entry: '',
  content: emptyContent,
  guid: '',
};

export class Cite extends Immutable.Record(defaultContent) {
  
  contentType: 'Cite';
  title: string;
  id: string;
  entry: string;
  content: ContentState;
  guid: string;
  
  constructor(params?: CiteParams) {
    super(augment(params));
  }

  with(values: CiteParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, toDraft) : Cite {

    const t = (root as any).cite;

    let model = new Cite({ guid });
    
    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    }
    if (t['@entry'] !== undefined) {
      model = model.with({ entry: t['@entry'] });
    }
    
    model = model.with({ content: toDraft(getChildren(t)) });
    
    return model;
  }

  toPersistence(toPersistence) : Object {
    return {
      cite: {
        '@title': this.title,
        '@id': this.id,
        '@entry': this.entry,
        '#array': toPersistence(this.content)['#array'],
      },
    };
  }
}
