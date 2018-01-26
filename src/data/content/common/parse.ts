import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { Unsupported } from '../unsupported';
import guid from 'utils/guid';
import { HasGuid } from 'data/types';
import { ContiguousText } from '../learning/contiguous';

export const ARRAY = '#array';
export const TITLE = '@title';
export const STYLE = '@style';
export const TEXT = '#text';
export const CDATA = '#cdata';

export const CONTIGUOUS_TEXT_ELEMENTS = [
  'p', '#cdata', '#text', 'em', 'sub',
  'sup', 'ipa', 'foreign',
  'cite', 'term', 'var', 'link', 'input_ref', 'm:math', 'activity_link', 'xref'];

const registeredTypes = {};


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

export function parseContent(obj: Object, supportedElementKeys: string[])
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
