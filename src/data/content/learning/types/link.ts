import * as Immutable from 'immutable';

import * as common from '../common';
import guid from 'utils/guid';
import { augment } from '../../common';
import { ContiguousText } from '../contiguous';
import { ContentType, ContentElement } from '../../common/interfaces';
import { parseContent } from '../../common/parse';
import { SUPPORTED_ELEMENTS as TEXT_ELEMENTS } from './text';

export type LinkElementType = 'ContiguousText' | 'Image';

export const SUPPORTED_ELEMENTS = [...TEXT_ELEMENTS, 'image'];

export interface LinkElement extends ContentElement<LinkElement> {
  contentType: LinkElementType;
}

export function parseLinkContent(obj: Object)
  : LinkElement {

  const result = parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, LinkElement>;

  return result.first();
}


export type LinkContentParams = {
  content?: LinkElement,
  guid?: string,
};

const defaultContent = {
  contentType: 'LinkContent',
  content: new ContiguousText(),
  guid: '',
};

export class LinkContent extends Immutable.Record(defaultContent)
  implements ContentType<LinkContent> {

  contentType: 'LinkContent';
  content: LinkElement;
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


