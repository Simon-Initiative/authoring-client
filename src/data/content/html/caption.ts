import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');

import { toPersistence } from './topersistence';
import { toDraft } from './todraft';

export type CaptionParams = {
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'Caption',
  content: emptyContent,
  guid: '',
};

export class Caption extends Immutable.Record(defaultContent) {
  
  contentType: 'Caption';
  content: ContentState;
  guid: string;
  
  constructor(params?: CaptionParams) {
    super(augment(params));
  }

  with(values: CaptionParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Caption {

    const t = (root as any).caption;

    let model = new Caption({ guid });
    model = model.with({ content: toDraft(getChildren(t)) });
    
    return model;
  }

  toPersistence() : Object {
    return {
      caption: {
        '#array': toPersistence(this.content)['#array'],
      },
    };
  }
}
