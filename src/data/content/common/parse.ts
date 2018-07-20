import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Unsupported } from '../unsupported';
import guid from 'utils/guid';
import { ContentElement } from './interfaces';
import { ContiguousText, ContiguousTextMode } from '../learning/contiguous';

export const ARRAY = '#array';
export const TITLE = '@title';
export const STYLE = '@style';
export const TEXT = '#text';
export const CDATA = '#cdata';

export const CONTIGUOUS_TEXT_ELEMENTS = [
  'p', '#cdata', '#text', 'em', 'sub',
  'sup', 'ipa', 'foreign', 'sym',
  'cite', 'term', 'var', 'link', 'extra', 'input_ref', 'm:math', '#math', 'activity_link', 'xref'];

export const registeredTypes = {};


export function registerType(
  elementName: string, factoryFn: (obj, guid, notify) => ContentElement) {
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
function normalizeInput(obj: Object, textElements: Object): Object[] {

  // First ensure we have an array, whether it is an array, embeds
  // an array in the #array syntax, or we wrap it
  let arr = null;
  if (obj instanceof Array) {
    arr = obj;
  } else if (obj[ARRAY] !== undefined && obj[ARRAY] instanceof Array) {
    arr = obj[ARRAY];
  } else {
    arr = [obj];
  }

  // If the array is empty, return a useful representation
  if (arr.length === 0) {
    return [{ '#text': '' }];
  }

  return arr;

}


export function getKey(item): Maybe<string> {
  const keys = Object.keys(item).filter(k => !k.startsWith('@'));

  if (keys.length === 0) {
    return Maybe.nothing();
  }
  return Maybe.just(keys[0]);
}

function parseElements(
  elements: Object[], factories, textElements, backingTextProvider, notify): ContentElement[] {

  const parsedObjects: ContentElement[] = [];

  // Buffer for contiguous text elements
  let textBuffer = [];

  elements.forEach((e) => {
    const maybeKey = getKey(e);

    maybeKey.caseOf({
      just: (key) => {

        // If this isn't a text element
        if (textElements[key] === undefined) {

          if (textBuffer.length > 0) {
            parsedObjects.push(ContiguousText.fromPersistence(
              textBuffer, guid(), ContiguousTextMode.Regular, backingTextProvider));
            textBuffer = [];
          }

          const parse = factories[key];

          if (parse !== undefined) {
            parsedObjects.push(parse(e, guid(), notify));
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
          parsedObjects.push(ContiguousText.fromPersistence(
            textBuffer, guid(), ContiguousTextMode.Regular, backingTextProvider));
          textBuffer = [];
        }

      },
    });

  });

  if (textBuffer.length > 0) {
    parsedObjects.push(ContiguousText.fromPersistence(
      textBuffer, guid(),
      ContiguousTextMode.Regular, backingTextProvider));
  }

  return parsedObjects;
}

function isAllContiguous(arr, textElements): boolean {
  return arr
    .reduce(
      (acc: boolean, e) => {
        return acc && getKey(e).caseOf(
          { just: k => textElements[k] !== undefined, nothing: () => false });
      },
      true);
}

export function parseContent(
  obj: Object,
  supportedElementKeys: string[],
  backingTextProvider: Object = null,
  notify: () => void)
  : Immutable.OrderedMap<string, ContentElement> {

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

  const withoutParagraphs = Object.assign({}, textElements);
  delete withoutParagraphs['p'];

  // Normalize the input param shape into an array
  const inputAsArray = normalizeInput(obj, textElements);

  // If the input is an array of all contiguous text elements, we do not want to
  // parse them each as a separate ContiguousText as that would effectively render
  // them as paragraphs - rather we want them all contained
  // inline in one ContiguousText instance.
  if (inputAsArray.length > 1 && isAllContiguous(inputAsArray, withoutParagraphs)) {

    // Parse these elements in simple mode (to get the effect of one ContentBlock),
    // but be sure to reset to Regular mode.
    const text = ContiguousText.fromPersistence(
      inputAsArray, guid(), ContiguousTextMode.SimpleText, backingTextProvider)
      .with({ mode: ContiguousTextMode.Regular });
    return Immutable.OrderedMap<string, ContentElement>([[text.guid, text]]);
  }

  // Parse the elements and collect the deserialized content here
  const parsedObjects: ContentElement[]
    = parseElements(inputAsArray, factories, textElements, backingTextProvider, notify);

  // Convert to the Immutable representation and return
  const keyValuePairs = parsedObjects.map(h => [h.guid, h]);
  return Immutable.OrderedMap<string, ContentElement>(keyValuePairs);

}
