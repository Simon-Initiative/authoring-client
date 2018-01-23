
const ELEMENTS_MIXED = ['formula', 'code', 'image', 'quote'];
const ELEMENTS_MEDIA = ['video', 'audio', 'youtube', 'iframe'];
const ELEMENTS_SEMANTIC = ['popout'];
const ELEMENTS_BLOCK = ['table', 'codeblock'];
const ELEMENTS_LIST = ['ol', 'ul', 'dl'];

const CONTIGUOUS_TEXT_BLOCKS = ['p', '#text'];

const CONTENT_MIXED = [...ELEMENTS_MIXED];
const CONTENT_INLINE = [...ELEMENTS_MIXED, ...ELEMENTS_BLOCK, ...ELEMENTS_MEDIA, ...ELEMENTS_LIST];
const CONTENT_FLOW = [...ELEMENTS_MIXED, ...ELEMENTS_BLOCK, ...ELEMENTS_MEDIA, ...ELEMENTS_LIST];
const CONTENT_BODY = [
  ...ELEMENTS_MIXED, ...ELEMENTS_BLOCK, ...ELEMENTS_MEDIA, ...ELEMENTS_LIST,
  ...ELEMENTS_SEMANTIC, 'wb:inline', 'activity'];


export interface HasFlowContent {
  contentType: FlowContent;
}

