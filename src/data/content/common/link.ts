import * as Immutable from 'immutable';

import guid from 'utils/guid';
import { augment } from '../common';
import { ContiguousText } from '../learning/contiguous';
import { ContentType, ContentElement } from './interfaces';
import { parseContent } from './parse';
import { SUPPORTED_ELEMENTS as TEXT_ELEMENTS } from './text';

export type LinkElementType = 'ContiguousText' | 'Image';

export const SUPPORTED_ELEMENTS = [...TEXT_ELEMENTS, 'image'];

export interface LinkElement extends ContentElement<LinkElement> {
  contentType: LinkElementType;
}

export function parseLinkContent(obj: Object)
  : Immutable.OrderedMap<string, LinkElement> {

  const result = parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, LinkElement>;

  return result;
}


export type LinkContentParams = {
  content?: Immutable.OrderedMap<string, LinkElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'LinkContent',
  content: Immutable.OrderedMap<string, LinkElement>(),
  guid: '',
};

export class LinkContent extends Immutable.Record(defaultContent)
  implements ContentType<LinkContent, LinkElement> {

  contentType: 'LinkContent';
  content: Immutable.OrderedMap<string, LinkElement>;
  guid: string;

  constructor(params?: LinkContentParams) {
    super(augment(params));
  }

  with(values: LinkContentParams) {
    return this.merge(values) as this;
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
  }

  clone() : LinkContent {
    return this.with({
      content: this.content.map(c => c.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : LinkContent {
    return new LinkContent({ guid, content: parseLinkContent(root) });
  }

  toPersistence() : Object {
    return this.content.first().toPersistence();
  }
}


