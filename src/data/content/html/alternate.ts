import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');

import { toPersistence } from './topersistence';
import { toDraft } from './todraft';

export type AlternateParams = {
  title?: string,
  idref?: string,
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'Alternate',
  title: '',
  idref: '',
  content: emptyContent,
  guid: '',
};

export class Alternate extends Immutable.Record(defaultContent) {
  
  contentType: 'Alternate';
  title: string;
  idref: string;
  content: ContentState;
  guid: string;
  
  constructor(params?: AlternateParams) {
    super(augment(params));
  }

  with(values: AlternateParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Alternate {

    const t = (root as any).alternate;

    let model = new Alternate({ guid });
    
    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }
    
    model = model.with({ content: toDraft(getChildren(t)) });
    
    return model;
  }

  toPersistence() : Object {
    return {
      alternate: {
        '@title': this.title,
        '@idref': this.idref,
        '#array': toPersistence(this.content),
      },
    };
  }
}
