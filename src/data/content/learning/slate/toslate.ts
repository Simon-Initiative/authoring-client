import * as common from '../common';
import * as Immutable from 'immutable';
import { registeredTypes } from '../../common/parse';
import guid from 'utils/guid';
import { InputRef, InputRefType } from 'data/content/learning/input_ref';
import { Value, ValueJSON, BlockJSON, InlineJSON, MarkJSON, Data, Mark } from 'slate';

// The elements that we handle as slate marks
const marks = Immutable.Set<string>(
  ['foreign', 'ipa', 'sub', 'sup', 'term', 'bdo', 'var', 'em', 'code']);

// The elements that are handled as slate inlines, and their corresponding
// handlers.
const inlineHandlers = {
  command: subElementInline.bind(undefined, 'command', 'title'),
  link: contentBasedInline,
  xref: contentBasedInline,
  activity_link: contentBasedInline,
  input_ref: inputRef,
  quote: contentBasedInline,
  formula: stripOutInline,
  'm:math': terminalInline,
  '#math': terminalInline,
  extra: subElementInline.bind(undefined, 'extra', 'anchor'),
  image: terminalInline,
  sym: terminalInline,
  cite: contentBasedInline,
};

const blockHandlers = {
  p: paragraph,
  '#text': pureTextBlockHandler.bind(undefined, common.TEXT),
  '#cdata': pureTextBlockHandler.bind(undefined, common.CDATA),
  '#array': arrayHandler,
};

// The only exported function and the entry point for all contiguous
// text to slate conversion.
export function toSlate(

  // The objects representing the raw data that we need to parse
  // into the corresponding slate representation
  toParse: Object[],

  // Indicates whether the text being parsed is 'inline' - meaning it
  // comes from a context (like a choice in a mc question) where if
  // there is only one block we do not want it to serialize back with
  // an outer paragraph
  isInlineText: boolean = false,

  // An object map of input items ids to input ref wrappers. This is
  // used only in the context of parsing assessments - where we have
  // already parsed the items and parts portion of a question and now
  // are parsing the body. This is used primarily to know what the type
  // (numeric, text, fillintheblank) an input_ref element is when we
  // encounter it in the body.
  backingTextProvider: Object = null): Value {

  const json: ValueJSON = {
    document: {
      nodes: [],
    },
  };

  normalizeInput(toParse, isInlineText)
    .forEach(entry => handleBlock(entry, json, backingTextProvider));

  return Value.fromJSON(json);
}

// true of inline pieces that can be collected within an enclosing paragraph
function inlinePiece(e: any) : boolean {
  const key = common.getKey(e);
  return marks.contains(key) || inlineHandlers[key] !== undefined || key === '#text';
}

// Normalize the sometimes strange format of the input to an array of blocks
function normalizeInput(toParse, isInlineText: boolean): Object[] {

  if (isInlineText) {
    if (toParse instanceof Array) {
      return [{ p: { '#array': toParse } }];
    }
    if (toParse['#array'] !== undefined) {
      return [{ p: { '#array': toParse['#array'] } }];
    }
    return [{ p: { '#array': [toParse] } }];
  }

  if (toParse instanceof Array) {
    // Normalize the case where a single entry exists - and that entry is a
    // mark or inline.  This can happen with choice bodies, where we strip
    // out the outer paragraph on one paragraph long choice bodies.
    if (toParse.length === 1) {
      const key = common.getKey(toParse[0]);
      if (marks.contains(key) || inlineHandlers[key] !== undefined) {
        return [{ p: { '#array': toParse } }];
      }
    } else if (toParse.every(inlinePiece)) {
      // (AUTHORING-2324) wrap up multiple inline pieces including #text. This
      // can arise from styled complex list item content not wrapped in paragraph
      return [{ p: { '#array': toParse } }];
    }
  }

  return toParse;
}

// Handle parsing of a block based off of a registry of
// block handlers.
function handleBlock(item: Object, json: ValueJSON, backingTextProvider: Object) {

  const key = common.getKey(item);
  if (key === undefined || blockHandlers[key] === undefined) {
    return;
  }

  // Based off of the key, we look up the corresponding block handler and
  // invoke it so that it gets parsed correctly.
  blockHandlers[key](item, json, backingTextProvider);
}

// Given a style mark object, determine if it is the parent of
// another, nested mark.  A regular mark would have either a #text
// or #cdata attr, so we simply check that neither is defined.
function isNestedMark(item: Object): boolean {
  return item['#text'] === undefined && item['#cdata'] === undefined;
}

// Given a style mark object, determine if it is empty, that is it
// contains no actual text and no nested mark.
function isEmptyMark(item: Object): boolean {

  // A mark object is empty if it only contains attributes or is empty.
  // In other words, it is missing #text and it is missing a nested element.
  return Object.keys(item).filter(k => !k.startsWith('@')).length === 0;
}

// Create a slate mark from a persisted from a mark element. For em elements,
// we use 'em' as the mark style for bold, all other em styles we use
// the style name. sub, sup and other non em styles are just their
// element names.
function getMark(item: Object): Mark {
  const key = common.getKey(item);
  if (key === 'em') {
    if (item['em']['@style'] !== undefined && item['em']['@style'] !== 'bold') {
      return Mark.create({
        object: 'mark',
        type: item['em']['@style'],
        data: {},
      });
    }
  }

  // Currently, `foreign` is the only mark to use the data object to store additional
  // attributes.
  const data = key === 'foreign'
    ? Data.create({ lang: item[key]['@lang'] })
    : {};

  return Mark.create({
    object: 'mark',
    type: key,
    data,
  });
}

// Safely access the children elements of an item.
function getChildren(item: Object, ignore = null): Object[] {

  const key = common.getKey(item);
  if (key === undefined) {
    return [];
  }

  if (item[key][common.ARRAY] !== undefined) {
    return item[key][common.ARRAY].filter(c => common.getKey(c) !== ignore);
  }
  if (item[key][common.TEXT] !== undefined) {
    return [item[key]];
  }
  if (item[key][common.CDATA] !== undefined) {
    return [item[key]];
  }

  return [item[key]];
}


function pureTextBlockHandler(
  key: string, item: Object, json: ValueJSON, backingTextProvider: Object) {

  const p: BlockJSON = {
    object: 'block',
    type: 'paragraph',
    data: extractId(item),
    nodes: [{
      object: 'text',
      text: item[key],
      marks: [],
    }],
  };
  json.document.nodes.push(p);
}

function arrayHandler(item: Object, json: ValueJSON, backingTextProvider: Object) {
  item['#array'].forEach(item => handleBlock(item, json, backingTextProvider));
}

function paragraph(item: Object, json: ValueJSON, backingTextProvider: Object) {

  const p: BlockJSON = {
    object: 'block',
    type: 'paragraph',
    data: extractId(item),
    nodes: [],
  };
  json.document.nodes.push(p);

  getChildren(item).forEach(subItem => handleChild(subItem, p, backingTextProvider));
}

// This inline handler bypasses the inline and simply adds the content
// that it contains.  When this document is saved, the inline is effectively stripped out.
function stripOutInline(item: Object, parent: BlockJSON, backingTextProvider) {
  const children = getChildren(item);
  children.forEach(subItem => handleChild(subItem, parent, backingTextProvider));
}

// A terminal inline is one that has no nested content that is displayed in the
// slate editor.  We handle it strictly by parsing any content that we do find
// into the corresponding content type wrapper.
function terminalInline(item: Object, parent: BlockJSON, backingTextProvider): InlineJSON {

  const key = common.getKey(item);

  // This is the call to 'fromPersistence' on the data wrapper
  const data = { value: registeredTypes[key](item) };
  const type = data.value.contentType;

  const inline: InlineJSON = {
    object: 'inline',
    type,
    data,
    nodes: [],
  };
  parent.nodes.push(inline);

  return inline;
}

// Sub element inline elements are unique in that they have content that is displayed
// and edited within the slate editor - but that content is serialized to and
// from a specific sub element of the parent, as opposed to directly in the '#array' array.
function subElementInline(
  key: string, subElementKey: string, item: Object, parent: BlockJSON, backingTextProvider) {

  const inline = terminalInline(item, parent, backingTextProvider);
  const subElement = item[key]['#array'].filter(k => common.getKey(k) === subElementKey)[0];
  const children = getChildren(subElement);
  children.forEach(subItem => handleChild(subItem, inline, backingTextProvider));
}

// Input refs must be handled specially - since we need to set the
// type of the input ref based on the contentType of the input from
// the backingTextProvider
function inputRef(item: Object, parent: BlockJSON, backingTextProvider): InlineJSON {

  const value = (InputRef.fromPersistence as any)(item);
  const inputTypeStr = backingTextProvider && backingTextProvider[value.input].contentType;
  let inputType = InputRefType.Numeric;
  if (inputTypeStr === 'Text') {
    inputType = InputRefType.Text;
  } else if (inputTypeStr === 'FillInTheBlank') {
    inputType = InputRefType.FillInTheBlank;
  }
  const data = { value: value.with({ inputType }) };
  const type = data.value.contentType;

  const inline: InlineJSON = {
    object: 'inline',
    type,
    data,
    nodes: [],
  };
  parent.nodes.push(inline);

  return inline;
}

// Content based inlines deserialize mostly as terminal ones, except that we
// then need to process their children nodes
function contentBasedInline(item: Object, parent: BlockJSON, backingTextProvider) {

  const inline = terminalInline(item, parent, backingTextProvider);

  const children = getChildren(item);
  children.forEach(subItem => handleChild(subItem, inline, backingTextProvider));
}

function handleChild(item: Object, parent: BlockJSON | InlineJSON, backingTextProvider) {

  const key = common.getKey(item);

  // The key determines the type of the child element that we have encountered.
  // It can be one of three types:

  // 1. An inline element such as link or input_ref
  if (inlineHandlers[key] !== undefined) {
    inlineHandlers[key](item, parent, backingTextProvider);

    // 2. A style mark, such as em or sup
  } else if (marks.contains(key)) {
    processMark(item, parent, Immutable.List<Mark>());

    // 3. Unmarked text
  } else if (key === '#text' || key === '#cdata') {
    parent.nodes.push({
      object: 'text',
      text: item[key],
      marks: [],
    });
  }
}

// Handle an OLI style element that we will render as a Slate mark.
function processMark(item: Object,
  parent: BlockJSON | InlineJSON, previousMarks: Immutable.List<Mark>) {

  // If this mark is the parent of another mark, add this style and
  // process recursively. This allows us to handle situations like this:
  // {
  //   em: {
  //     sub: {
  //       "#text": "This is both bold and subscript"
  //     }
  //   }
  // }
  //

  if (!isEmptyMark(item)) {

    if (isNestedMark(item)) {
      processMark(getChildren(item)[0], parent, previousMarks.push(getMark(item)));
      return;
    }

    // terminal mark should have unmarked text in either #cdata or #text attr
    const itemText = item['#cdata'] !== undefined ? item['#cdata'] : item['#text'];
    parent.nodes.push({
      object: 'text',
      text: itemText,
      marks: previousMarks.toArray(),
    });

  }
}

function extractId(item: any): Object {
  const data = { id: '' };

  if (item !== undefined && item !== null && item.p && item.p['@id'] !== undefined) {
    data.id = item.p['@id'];
  } else {
    data.id = guid();
  }
  return data;
}
