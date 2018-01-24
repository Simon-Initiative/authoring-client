import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as content from './content';
import * as common from './common';
import { HasGuid } from 'data/types';

const registeredTypes = {};

export function registerType(elementName: string, factoryFn: (obj) => HasGuid) {
  if (registeredTypes[elementName] === undefined) {
    registeredTypes[elementName] = factoryFn;
  } else {
    throw Error('Duplicate content type registered');
  }
}


function isVirtualParagraph(obj: Object) {


}

function isEmptyContent(obj) {

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

  const textBuffer = [];
  elements.forEach((e) => {
    const key = common.getKey(e);

    if (key === undefined || key === null)

    if (textElements[key])
  });

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
  const textElements = content.CONTIGUOUS_TEXT_ELEMENTS.reduce(
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
  : Immutable.OrderedMap<string, content.HasFlowContent> {

  return parseContent(
    obj,
    content.CONTENT_FLOW) as Immutable.OrderedMap<string, content.HasFlowContent>;
}


