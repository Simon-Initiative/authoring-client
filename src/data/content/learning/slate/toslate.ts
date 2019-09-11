import * as common from '../common';
import * as Immutable from 'immutable';
import { registeredTypes } from '../../common/parse';
import guid from 'utils/guid';
import { InputRef, InputRefType } from 'data/content/learning/input_ref';
import { Value, ValueJSON, BlockJSON, InlineJSON, MarkJSON } from 'slate';

const marks = Immutable.Set<string>(
  ['foreign', 'ipa', 'sub', 'sup', 'term', 'bdo', 'var', 'em']);

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
  return toParse;

}

// Handle parsing of a block based off of a registry of
// block handlers.
function handleBlock(item: Object, json: ValueJSON, backingTextProvider: Object) {

  const key = common.getKey(item);
  if (key === undefined) {
    return;
  }

  // Based off of the key, we look up the corresponding block handler and
  // invoke it so that it gets parsed correctly.
  blockHandlers[key](item, json, backingTextProvider);
}


function isMarkOnly(item: Object): boolean {
  return item['#text'] === undefined;
}

// Extract the mark style name from a mark element. For em elements,
// we use 'em' as the mark style for bold, all other em styles we use
// the style name.  sub, sup and other non em styles are just there
// element names.
function getMark(item: Object) {
  const key = common.getKey(item);
  if (key === 'em') {
    if (item['em']['@style'] !== undefined && item['em']['@style'] !== 'bold') {
      return item['em']['@style'];
    }
  }
  return key;
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

const inlineHandlers = {
  command,
  link: contentBasedInline,
  xref: contentBasedInline,
  activity_link: contentBasedInline,
  input_ref: inputRef,
  quote: contentBasedInline,
  code: contentBasedInline,
  formula: stripOutInline,
  'm:math': terminalInline,
  '#math': terminalInline,
  extra,
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

function stripOutInline(item: Object, parent: BlockJSON, backingTextProvider) {
  const children = getChildren(item);
  children.forEach(subItem => handleChild(subItem, parent, backingTextProvider));
}

function terminalInline(item: Object, parent: BlockJSON, backingTextProvider): InlineJSON {

  const key = common.getKey(item);
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

function extra(item: Object, parent: BlockJSON, backingTextProvider) {

  const inline = terminalInline(item, parent, backingTextProvider);
  const anchor = item['extra']['#array'].filter(k => common.getKey(k) === 'anchor')[0];
  const children = getChildren(anchor);
  children.forEach(subItem => handleInlineChild(subItem, inline, backingTextProvider));
}

function command(item: Object, parent: BlockJSON, backingTextProvider) {

  const inline = terminalInline(item, parent, backingTextProvider);
  const anchor = item['command']['#array'].filter(k => common.getKey(k) === 'title')[0];
  const children = getChildren(anchor);
  children.forEach(subItem => handleInlineChild(subItem, inline, backingTextProvider));
}

function inputRef(item: Object, parent: BlockJSON, backingTextProvider): InlineJSON {

  const value = (InputRef.fromPersistence as any)(item);
  const inputTypeStr = backingTextProvider[value.input].contentType;
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
  children.forEach(subItem => handleInlineChild(subItem, inline, backingTextProvider));
}

function handleChild(item: Object, parent: BlockJSON, backingTextProvider) {
  const key = common.getKey(item);
  if (inlineHandlers[key] !== undefined) {
    inlineHandlers[key](item, parent, backingTextProvider);
  } else if (marks.contains(key)) {
    processMark(item, parent, Immutable.List<string>());
  } else if (key === '#text' || key === '#cdata') {
    parent.nodes.push({
      object: 'text',
      text: item[key],
      marks: [],
    });
  }
}

function handleInlineChild(item: Object, parent: InlineJSON, backingTextProvider) {
  const key = common.getKey(item);
  if (marks.contains(key)) {
    processMark(item, parent, Immutable.List<string>());
  } else if (key === '#text' || key === '#cdata') {
    parent.nodes.push({
      object: 'text',
      text: item[key],
      marks: [],
    });
  }
}

function processMark(item: Object,
  parent: BlockJSON | InlineJSON, previousMarks: Immutable.List<string>) {

  if (isMarkOnly(item)) {
    processMark(getChildren(item)[0], parent, previousMarks.push(getMark(item)));
    return;
  }

  const marks = previousMarks.toArray().map(type => ({
    object: 'mark',
    type,
    data: {},
  }) as MarkJSON);

  parent.nodes.push({
    object: 'text',
    text: item['#text'],
    marks,
  });
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
