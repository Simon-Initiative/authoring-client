import * as Immutable from 'immutable';

import * as common from '../html/common';
import guid from 'utils/guid';
import { augment } from '../common';
import { ContiguousText } from '../html/contiguous';
import { parseLinkContent, LinkElement } from './parser';

export type LinkContentParams = {
  content?: LinkElement,
  guid?: string,
};

const defaultContent = {
  contentType: 'LinkContent',
  content: new ContiguousText(),
  guid: '',
};

export class LinkContent extends Immutable.Record(defaultContent) {

  contentType: 'LinkContent';
  content: LinkElement;
  guid: string;

  constructor(params?: LinkContentParams) {
    super(augment(params));
  }

  with(values: LinkContentParams) {
    return this.merge(values) as this;
  }


  clone() : LinkContent {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : LinkContent {
    return new LinkContent({ guid, content: parseLinkContent(root) });
  }

  toPersistence() : Object {
    return this.content.toPersistence();
  }
}


