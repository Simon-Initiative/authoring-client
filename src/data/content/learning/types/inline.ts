import * as Immutable from 'immutable';
import { parseContent } from '../../common/parse';
import { augment, getChildren } from '../../common';
import { ContentType, ContentElement } from '../../common/interfaces';

export type InlineElementType =
  'Formula' | 'Code' | 'Image' | 'Quote' | 'Table' | 'CodeBlock' | 'Video' | 'Audio' | 'YouTube' |
  'IFrame' | 'Ol' | 'Ul' | 'Dl' | 'ContiguousText';

export interface InlineElement extends ContentElement<InlineElement> {
  contentType: InlineElementType;
}

const ELEMENTS_MIXED = ['formula', 'code', 'image', 'quote'];
const ELEMENTS_MEDIA = ['video', 'audio', 'youtube', 'iframe'];
const ELEMENTS_BLOCK = ['table', 'codeblock'];
const ELEMENTS_LIST = ['ol', 'ul', 'dl'];

export const SUPPORTED_ELEMENTS = [...ELEMENTS_MIXED, ...ELEMENTS_BLOCK,
  ...ELEMENTS_MEDIA, ...ELEMENTS_LIST];

export function parseInlineContent(obj: Object)
  : Immutable.OrderedMap<string, InlineElement> {

  return parseContent(
    obj,
    SUPPORTED_ELEMENTS) as Immutable.OrderedMap<string, InlineElement>;
}


export type InlineContentParams = {
  content?: Immutable.OrderedMap<string, InlineElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'InlineContent',
  content: Immutable.OrderedMap<string, InlineElement>(),
  guid: '',
};

export class InlineContent extends Immutable.Record(defaultContent)
  implements ContentType<InlineContent> {

  contentType: 'InlineContent';
  content: Immutable.OrderedMap<string, InlineElement>;
  guid: string;

  constructor(params?: InlineContentParams) {
    super(augment(params));
  }

  with(values: InlineContentParams) {
    return this.merge(values) as this;
  }

  clone(): InlineContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  supportedElements() {
    return SUPPORTED_ELEMENTS;
  }

  fromPersistence(root: Object, guid: string) : InlineContent {

    const content = parseInlineContent(root);
    return new InlineContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
