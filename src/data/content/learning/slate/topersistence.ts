
import { Value, Block, Inline, Text, Mark } from 'slate';
import guid from 'utils/guid';

import * as common from '../common';

// Translation routine from slate to OLI JSON. The basic approach is
// to iterate through the top-level Slate blocks, and for each block
// iterate through the child nodes.  We currently are using Slate in
// a way where we have only these two levels, so the parsing is rather
// straightforward.  Blocks get turned into paragraphs, and child elements
// get translated to #text elements, style elements and things like
// links, input refs, etc.
export function toPersistence(value: Value, inlineText = false): Object {

  const root = { body: { '#array': [] } };
  const seenIds = {};

  // Loop through the top-level blocks
  root.body['#array'] = value.document.nodes
    .toArray()
    .map(node => translateNode(node as Block, seenIds));

  // If inlineText is set - we strip off the outer paragraph
  return inlineText
    ? adjustInlineText(root)
    : root.body['#array'];
}

// Top-level block handler.
function translateNode(node: Block, seenIds: Object) {
  const content = [];

  // Process each child node
  node.nodes.forEach((n) => {
    if (n.object === 'text' && n.text.length > 0) {
      handleText(n, content);
    } else if (n.object === 'inline') {
      handleInline(n, content);
    }
  });

  // An extra step for safety - we dedupe any ids that
  // we have already seen
  const originalId = node.data.get('id') === undefined
    ? guid()
    : node.data.get('id');
  const id = dedupe(seenIds, originalId);

  // Return it as a paragraph
  return { p: { '#array': content, '@id': id } };
}

function dedupe(seenIds: Object, id: string): string {
  if (seenIds[id] !== undefined) {
    const newId = guid();
    seenIds[newId] = true;
    return newId;
  }
  seenIds[id] = true;
  return id;
}

function handleText(node: Text, content) {

  // Handle the simple case of no marks first
  if (node.marks.size === 0) {
    content.push({ '#text': node.text });
  } else {
    handleMarkedText(node, content);
  }
}

// Handler for a text node that contains one or more marks
function handleMarkedText(node: Text, content) {
  const isBdo = (m: Mark) => m.type === 'bdo';
  const isForeign = (m: Mark) => m.type === 'foreign';

  // const marks = node.marks.toArray().map(m => m.type);
  const marks = node.marks.toArray();

  // if bdo is present, it must be the first element that
  // we place in the OLI JSON.  This is a DTD constraint.
  const adjustedMarks = marks.some(isBdo)
    ? [Mark.create({ type: 'bdo' }), ...marks.filter(m => !isBdo(m))]
    : marks;

  const root = { root: {} };
  let last = root;

  adjustedMarks.forEach((mark) => {
    // For each style, create the object representation for that style
    if (mark === undefined) {
      return;
    }

    const type = mark.type;
    const container = styleContainers[type];
    let style;
    if (container === undefined) {
      style = Object.assign({}, styleContainers.em());
    } else {
      style = Object.assign({}, container());
    }

    // Foreigns are a special case because they are currently the only
    // slate marks where we use the "data" object. Specifically,
    // we store the `@lang` attr here before it is persisted to OLI.
    if (isForeign(mark)) {
      style.foreign = { ...style.foreign, '@lang': mark.data.get('lang') };
    }

    // Now root this style object into the parent style
    const key = common.getKey(last);
    last[key][common.getKey(style)] = style[common.getKey(style)];
    last = style;
  });

  // Set the text on the last one, add the tree to the container
  last[common.getKey(last)]['#text'] = node.text;
  content.push(root.root);

  console.log('After handling marked, content is', content)
}

function handleInline(node: Inline, content) {
  if (inlineHandlers[node.type] !== undefined) {
    inlineHandlers[node.type](node, content);
  }
}

// Remove the outer paragraph when we are operating
// in inline text mode
function adjustInlineText(root) {
  const arr = root.body['#array'];
  const p = arr.find(e => common.getKey(e) === 'p');

  if (p !== undefined) {
    if (p.p['#text'] !== undefined) {
      delete p.p['@id'];
      delete p.p['@title'];
      return [p.p];
    }
    if (p.p['#array'] !== undefined) {
      return p.p['#array'];
    }
  } else {
    return root.body['#array'];
  }
}

// A mapping of inline sytles to the persistence
// object trees needed to represent them.  Functions
// are present here to provide a poor-man's immutability.
const styleContainers = {
  em: () => ({ em: {} }),
  italic: () => ({ em: { '@style': 'italic' } }),
  deemphasis: () => ({ em: { '@style': 'deemphasis' } }),
  highlight: () => ({ em: { '@style': 'highlight' } }),
  'line-through': () => ({ em: { '@style': 'line-through' } }),
  oblique: () => ({ em: { '@style': 'oblique' } }),
  var: () => ({ var: {} }),
  term: () => ({ term: {} }),
  bdo: () => ({ bdo: {} }),
  ipa: () => ({ ipa: {} }),
  foreign: () => ({ foreign: {} }),
  sub: () => ({ sub: {} }),
  sup: () => ({ sup: {} }),
};

// The handlers for the items that we represent as slate inlines.
const inlineHandlers = {
  Cite: cite,
  Command: subElementInlineHandler.bind(undefined, 'command', 'title'),
  Link: contentBasedInline,
  Xref: contentBasedInline,
  ActivityLink: contentBasedInline,
  Quote: contentBasedInline,
  Code: contentBasedInline,
  Math: terminalInline,
  Extra: subElementInlineHandler.bind(undefined, 'extra', 'anchor'),
  Image: terminalInline,
  Sym: terminalInline,
  InputRef: terminalInline,
};

// terminal inlines just serialize using the embedded wrapper
function terminalInline(i: Inline, container) {
  container.push(i.data.get('value').toPersistence());
}

// content inlines serialize the embedded wrapper, but also
// additional slate objects
function contentBasedInline(i: Inline, container) {
  const item = i.data.get('value').toPersistence();
  const key = common.getKey(item);
  container.push(item);

  if (item[key]['#array'] === undefined) {
    item[key]['#array'] = [];
  }
  const arr = item[key]['#array'];

  i.nodes.forEach((node) => {
    const textNode = node as Text;
    handleText(textNode, arr);
  });

}

function cite(i: Inline, container) {
  const wrapper = i.data.get('value');
  wrapper.entry !== ''
    ? terminalInline(i, container)
    : contentBasedInline(i, container);
}

// An inline handler that serializes from the content wrapper
// but that serializes the #array content from a sub element
function subElementInlineHandler(elementKey: string, subElementKey: string, i: Inline, container) {
  const item = i.data.get('value').toPersistence();

  const sub = { [subElementKey]: { '#array': [] } };
  const arr = sub[subElementKey]['#array'];

  i.nodes.forEach((node) => {
    const textNode = node as Text;
    handleText(textNode, arr);
  });

  // Replace the serialized sub element with the latest
  // from the slate nodes
  item[elementKey]['#array'][0] = sub;
  container.push(item);
}

