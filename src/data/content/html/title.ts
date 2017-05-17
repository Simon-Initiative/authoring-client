import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');

import { toPersistence } from './topersistence';
import { toDraft } from './todraft';

export type TitleParams = {
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'Title',
  content: emptyContent,
  guid: '',
};

export class Title extends Immutable.Record(defaultContent) {
  
  contentType: 'Title';
  content: ContentState;
  guid: string;
  
  constructor(params?: TitleParams) {
    super(augment(params));
  }

  with(values: TitleParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Title {

    const t = (root as any).title;

    let model = new Title({ guid });
    model = model.with({ content: toDraft(getChildren(t)) });
    
    return model;
  }

  toPersistence() : Object {
    return {
      title: {
        '#array': toPersistence(this.content),
      },
    };
  }
}
