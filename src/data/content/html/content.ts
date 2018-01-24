import { HasGuid } from 'data/types';

const ELEMENTS_MIXED = ['formula', 'code', 'image', 'quote'];
const ELEMENTS_MEDIA = ['video', 'audio', 'youtube', 'iframe'];
const ELEMENTS_SEMANTIC = ['popout'];
const ELEMENTS_BLOCK = ['table', 'codeblock'];
const ELEMENTS_LIST = ['ol', 'ul', 'dl'];

export const CONTIGUOUS_TEXT_ELEMENTS = ['p', '#text', '#cdata', 'em',
  'sub', 'sup', 'ipa', 'foreign', 'cite', 'term', 'var', 'link', 'xref', 'activity_link'];

export const CONTENT_MIXED = [...ELEMENTS_MIXED];
export const CONTENT_INLINE = [...ELEMENTS_MIXED, ...ELEMENTS_BLOCK,
  ...ELEMENTS_MEDIA, ...ELEMENTS_LIST];
export const CONTENT_FLOW = CONTENT_INLINE;
export const CONTENT_BODY = [
  ...ELEMENTS_MIXED, ...ELEMENTS_BLOCK, ...ELEMENTS_MEDIA, ...ELEMENTS_LIST,
  ...ELEMENTS_SEMANTIC, 'wb:inline', 'activity'];

export type InlineContent =
  'Formula' | 'Code' | 'Image' | 'Quote' | 'Table' | 'CodeBlock' | 'Video' | 'Audio' | 'YouTube' |
  'IFrame' | 'Ol' | 'Ul' | 'Dl' | 'Text';

export type FlowContent = InlineContent;

export interface HasInlineContent {

}

export interface HasFlowContent extends HasGuid {
  contentType: FlowContent;
}

