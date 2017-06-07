import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';

import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');


export type LinkParams = {
  target?: string,
  href?: string,
  internal?: boolean,
  title?: string,
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'Link',
  target: 'self',
  href: '',
  internal: false,
  title: '',
  content: emptyContent,
  guid: '',
};

export class Link extends Immutable.Record(defaultContent) {
  
  contentType: 'Link';
  content: ContentState;
  target: string;
  href: string;
  internal: boolean;
  title: string;
  guid: string;
  
  constructor(params?: LinkParams) {
    super(augment(params));
  }

  with(values: LinkParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, toDraft) : Link {

    const t = (root as any).link;

    let model = new Link({ guid });
    
    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@href'] !== undefined) {
      model = model.with({ href: t['@href'] });
    }
    if (t['@internal'] !== undefined) {
      model = model.with({ internal: t['@internal'] === 'true' });
    }
    if (t['@target'] !== undefined) {
      model = model.with({ target: t['@target'] });
    }
    
    model = model.with({ content: toDraft(getChildren(t)) });
    
    return model;
  }

  toPersistence(toPersistence) : Object {
    return {
      link: {
        '@title': this.title,
        '@href': this.href,
        '@target': this.target,
        '@internal': this.internal ? 'true' : 'false',
        '#array': toPersistence(this.content)['#array'],
      },
    };
  }
}
