import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as common from '../html/common';
import { ContiguousText } from '../html/contiguous';
import { Unsupported } from '../unsupported';
import guid from 'utils/guid';
import { HasGuid } from 'data/types';

const registeredTypes = {};

const ELEMENTS_TEXT = ['#text', 'em', 'sub', 'sup', 'ipa', 'foreign', 'input_ref',
  'cite', 'term', 'var', 'link', 'xref', 'activity_link'];
const ELEMENTS_MIXED = ['formula', 'code', 'image', 'quote'];
const ELEMENTS_MEDIA = ['video', 'audio', 'youtube', 'iframe'];
const ELEMENTS_SEMANTIC = ['popout', 'example', 'definition'];
const ELEMENTS_BLOCK = ['table', 'codeblock'];
const ELEMENTS_LIST = ['ol', 'ul', 'dl'];

export const CONTIGUOUS_TEXT_ELEMENTS = ['p', '#cdata', ...ELEMENTS_TEXT];

export const CONTENT_TEXT = [...ELEMENTS_TEXT];
export const CONTENT_LINK = [...ELEMENTS_TEXT, 'image'];
export const CONTENT_MIXED = [...ELEMENTS_MIXED];
export const CONTENT_INLINE = [...ELEMENTS_MIXED, ...ELEMENTS_BLOCK,
  ...ELEMENTS_MEDIA, ...ELEMENTS_LIST];
export const CONTENT_FLOW = CONTENT_INLINE;
export const CONTENT_MATERIAL = CONTENT_INLINE;
export const CONTENT_BODY = [
  ...ELEMENTS_MIXED, ...ELEMENTS_BLOCK, ...ELEMENTS_MEDIA, ...ELEMENTS_LIST,
  ...ELEMENTS_SEMANTIC, 'wb:inline', 'activity', 'section'];

// The type of content available within a link
export type LinkElementType = 'ContiguousText' | 'Image';

export type InlineElementType =
  'Formula' | 'Code' | 'Image' | 'Quote' | 'Table' | 'CodeBlock' | 'Video' | 'Audio' | 'YouTube' |
  'IFrame' | 'Ol' | 'Ul' | 'Dl' | 'ContiguousText';

// Workbook page body elements add semantic elements and 'section'
export type BodyElementType = InlineElementType |
  'Section' | 'WbInline' | 'Activity' | 'Definition' | 'Example' | 'Pullout';

// The DTDs define flow.content as identical to inline. But so
// that the DTDs match our code it makes sense to have a separate
// FlowElementType.  Same thing for material
export type FlowElementType = InlineElementType;
export type MaterialElementType = InlineElementType;

export interface Cloneable<T> {
  clone(): T;
}

export interface Persistable {
  toPersistence(): Object;
}


export interface LinkElement extends HasGuid, Persistable, Cloneable<InlineElement> {
  contentType: InlineElementType;
}

export interface InlineElement extends HasGuid, Persistable, Cloneable<InlineElement> {
  contentType: InlineElementType;
}

export interface FlowElement extends HasGuid, Persistable, Cloneable<FlowElement> {
  contentType: FlowElementType;
}

export interface MaterialElement extends HasGuid, Persistable, Cloneable<FlowElement> {
  contentType: MaterialElementType;
}

export interface BodyElement extends HasGuid, Persistable, Cloneable<BodyElement> {
  contentType: BodyElementType;
}

export function registerType(elementName: string, factoryFn: (obj) => HasGuid) {
  if (registeredTypes[elementName] === undefined) {
    registeredTypes[elementName] = factoryFn;
  } else {
    throw Error('Duplicate content type registered');
  }
}

// Sometimes serialization results in a top-level object of
// different structures. This normalizes these structtures to be
// consistently just an array of objects whose keys must have an
// element.
function normalizeInput(obj: Object, textElements: Object) : Object[] {

  // First ensure we have an array, whether it is an array, embeds
  // an array in the #array syntax, or we wrap it
  let arr = null;
  if (obj instanceof Array) {
    arr = obj;
  } else if (obj[common.ARRAY] !== undefined && obj[common.ARRAY] instanceof Array) {
    arr = obj[common.ARRAY];
  } else {
    arr = [obj];
  }

  // If the array is empty, return a useful representation
  if (arr.length === 0) {
    return [{ '#text': '' }];
  }

  return arr;

}


export function getKey(item) : Maybe<string> {
  const keys = Object.keys(item).filter(k => !k.startsWith('@'));

  if (keys.length === 0) {
    return Maybe.nothing();
  }
  return Maybe.just(keys[0]);
}

function parseElements(elements: Object[], factories, textElements) : HasGuid[] {

  const parsedObjects : HasGuid[] = [];

  // Buffer for contiguous text elements
  let textBuffer = [];

  elements.forEach((e) => {
    const maybeKey = getKey(e);

    maybeKey.caseOf({
      just: (key) => {
        // If this isn't a text element
        if (textElements[key] === undefined) {

          if (textBuffer.length > 0) {
            parsedObjects.push(ContiguousText.fromPersistence(textBuffer, guid()));
            textBuffer = [];
          }

          const parse = factories[key];
          if (parse !== undefined) {
            parsedObjects.push(parse(e, guid()));
          } else {
            // unsupported element
            parsedObjects.push(Unsupported.fromPersistence(e, guid()));
          }
        } else {
          textBuffer.push(e);
        }
      },
      nothing: () => {
        if (textBuffer.length > 0) {
          parsedObjects.push(ContiguousText.fromPersistence(textBuffer, guid()));
          textBuffer = [];
        }
        console.log('Encountered content with no key:');
        console.log(e);
      },
    });

  });

  if (textBuffer.length > 0) {
    parsedObjects.push(ContiguousText.fromPersistence(textBuffer, guid()));
  }

  return parsedObjects;
}

function parseContent(obj: Object, supportedElementKeys: string[])
  : Immutable.OrderedMap<string, HasGuid> {

  // Create a lookup table for the registered factory deserialization
  // functions based on the supported element keys
  const factories = supportedElementKeys.reduce(
    (m, c) => { m[c] = registeredTypes[c]; return m; },
    {});

  // These are the elements that when encountered in a continguous
  // range need to be collapsed into a Text content instance.
  const textElements = CONTIGUOUS_TEXT_ELEMENTS.reduce(
    (m, c) => { m[c] = true; return m; },
    {});

  // Normalize the input param shape into an array
  const inputAsArray = normalizeInput(obj, textElements);

  // Parse the elements and collect the deserialized content here
  const parsedObjects : HasGuid[] = parseElements(inputAsArray, factories, textElements);

  // Convert to the Immutable representation and return
  const keyValuePairs = parsedObjects.map(h => [h.guid, h]);
  return Immutable.OrderedMap<string, HasGuid>(keyValuePairs);
}

export function parseFlowContent(obj: Object)
  : Immutable.OrderedMap<string, FlowElement> {

  return parseContent(
    obj,
    CONTENT_FLOW) as Immutable.OrderedMap<string, FlowElement>;
}


export function parseInlineContent(obj: Object)
  : Immutable.OrderedMap<string, InlineElement> {

  return parseContent(
    obj,
    CONTENT_INLINE) as Immutable.OrderedMap<string, InlineElement>;
}


export function parseLinkContent(obj: Object)
  : LinkElement {

  const result = parseContent(
    obj,
    CONTENT_LINK) as Immutable.OrderedMap<string, LinkElement>;

  return result.first();
}


export function parseTextContent(obj: Object)
  : ContiguousText {

  const result = parseContent(
    obj,
    CONTENT_TEXT) as Immutable.OrderedMap<string, ContiguousText>;

  return result.first();
}


export function parseMaterialContent(obj: Object)
  : Immutable.OrderedMap<string, MaterialElement> {

  return parseContent(
    obj,
    CONTENT_MATERIAL) as Immutable.OrderedMap<string, MaterialElement>;
}

export function parseBodyContent(obj: Object)
  : Immutable.OrderedMap<string, InlineElement> {

  return parseContent(
    obj,
    CONTENT_INLINE) as Immutable.OrderedMap<string, InlineElement>;
}


