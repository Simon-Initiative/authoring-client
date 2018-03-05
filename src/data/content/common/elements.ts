import * as Immutable from 'immutable';
import { parseContent } from './parse';
import { augment, getChildren } from '../common';
import { ContentElement } from './interfaces';
import { ContiguousText } from '../learning/contiguous';
import { Maybe } from 'tsmonad';
import createGuid from 'utils/guid';

const ELEMENTS_MIXED = ['formula', 'code', 'image', 'quote'];
const ELEMENTS_MEDIA = ['video', 'audio', 'youtube', 'iframe'];
const ELEMENTS_BLOCK = ['table', 'codeblock'];
const ELEMENTS_LIST = ['ol', 'ul', 'dl'];
const ELEMENTS_SEMANTIC = ['popout', 'example', 'definition'];

export const TEXT_ELEMENTS = ['#text', 'em', 'sub', 'sup', 'ipa', 'foreign',
  'cite', 'term', 'var', 'link', 'activity_link', 'xref', 'input_ref'];
export const INLINE_ELEMENTS = [...ELEMENTS_MIXED, ...ELEMENTS_BLOCK,
  ...ELEMENTS_MEDIA, ...ELEMENTS_LIST, ...TEXT_ELEMENTS];
export const FLOW_ELEMENTS = [...INLINE_ELEMENTS];
export const LINK_ELEMENTS = [...TEXT_ELEMENTS, 'image'];
export const MATERIAL_ELEMENTS = [...INLINE_ELEMENTS];
export const BOX_ELEMENTS = [...MATERIAL_ELEMENTS, 'materials', 'alternatives'];
export const BODY_ELEMENTS = [...MATERIAL_ELEMENTS, ...ELEMENTS_SEMANTIC];

export type ContentElementsParams = {
  content?: Immutable.OrderedMap<string, ContentElement>,
  supportedElements?: Immutable.List<string>,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContentElements',
  content: Immutable.OrderedMap<string, ContentElement>(),
  supportedElements: Immutable.List(),
  guid: '',
};

export class ContentElements extends Immutable.Record(defaultContent) {

  contentType: 'ContentElements';
  content: Immutable.OrderedMap<string, ContentElement>;
  supportedElements: Immutable.List<string>;
  guid: string;

  constructor(params?: ContentElementsParams) {
    super(augment(params));
  }

  with(values: ContentElementsParams) {
    return this.merge(values) as this;
  }

  clone(): ContentElements {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  extractPlainText() : Maybe<string> {
    const t = this.content.toArray().filter(c => c.contentType === 'ContiguousText');
    if (t.length > 0) {
      return (t[0] as ContiguousText).extractPlainText();
    }
    return Maybe.nothing();
  }

  static fromPersistence(
    root: Object, guid: string,
    supportedElements: string[]) : ContentElements {

    const content = parseContent(root, supportedElements);
    return new ContentElements({ guid, content,
      supportedElements: Immutable.List(supportedElements) });
  }

  static fromText(text: string, guid: string, supportedElements: string[]) : ContentElements {
    const t = ContiguousText.fromText(text, createGuid());
    return new ContentElements({ guid,
      supportedElements: Immutable.List(supportedElements),
      content: Immutable.OrderedMap<string, ContentElement>().set(t.guid, t) });
  }

  toPersistence() : Object[] {
    const initial : Object[] = [];

    const items = (this.content.toArray()
      .map(e => e.toPersistence())
      .reduce(
        (p: Object[], c) => {
          if (c instanceof Array) {
            c.forEach(i => p.push(i));
            return p;
          }
          p.push(c);
          return p;
        },
        initial) as Object[]);

    return items;
  }
}
