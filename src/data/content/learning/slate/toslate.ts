import * as common from '../common';
import * as Immutable from 'immutable';
import { registeredTypes } from '../../common/parse';
import guid from 'utils/guid';

import { Value, ValueJSON, BlockJSON, InlineJSON, MarkJSON } from 'slate';

const marks = Immutable.Set<string>(
  ['foreign', 'ipa', 'sub', 'sup', 'term', 'bdo', 'var', 'em']);

export function toSlate(
  toParse: Object[],
  isInlineText: boolean = false, backingTextProvider: Object = null): Value {

  const json: ValueJSON = {
    document: {
      nodes: [],
    },
  };

  normalizeInput(toParse, isInlineText)
    .forEach(entry => parse(entry, json, backingTextProvider));

  return Value.fromJSON(json);
}

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

function parse(item: Object, json: ValueJSON, backingTextProvider: Object) {

  const key = common.getKey(item);

  if (key === undefined) {
    return;
  }

  blockHandlers[key](item, json, backingTextProvider);
}


function isMarkOnly(item: Object): boolean {
  return item['#text'] === undefined;
}

function getMark(item: Object) {
  const key = common.getKey(item);
  if (key === 'em') {
    if (item['@style'] !== undefined) {
      return item['@style'];
    }
  }
  return key;
}

function getChildren(item: Object, ignore = null): Object[] {

  const key = common.getKey(item);

  // Handle a case where there is no key
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
  item['#array'].forEach(item => parse(item, json, backingTextProvider));
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
  link: contentBasedInline,
  xref: contentBasedInline,
  activity_link: contentBasedInline,
  input_ref: terminalInline,
  quote: contentBasedInline,
  code: contentBasedInline,
  formula: stripOutInline,
  'm:math': terminalInline,
  '#math': terminalInline,
  extra: terminalInline,
  image: terminalInline,
  sym: terminalInline,
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
