import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Image } from './image';

import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');

type LinkContent = ContentState | Image;

export type LinkParams = {
  target?: string,
  href?: string,
  internal?: boolean,
  title?: string,
  content?: LinkContent,
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
  content: LinkContent;
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

    const children = getChildren(t);

    if (children instanceof Array 
      && children.length === 1 && (children[0] as any).image !== undefined) {
      model = model.with({ content: Image.fromPersistence(children[0], '', toDraft) });
    } else {
      model = model.with({ content: toDraft(children) });
    }
    
    return model;
  }

  toPersistence(toPersistence) : Object {

    const link = {
      link: {
        '@title': this.title,
        '@href': this.href,
        '@target': this.target,
        '@internal': this.internal ? 'true' : 'false',  
      },
    };

    if (this.content instanceof Image) {
      link.link['#array'] = [this.content.toPersistence(toPersistence)];
    } else {
      link.link['#array'] = toPersistence(this.content)['#array'];
    }

    return link;
  }
}
