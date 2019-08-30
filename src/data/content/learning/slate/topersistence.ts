
import { Value, Block, Inline, Text } from 'slate';

import * as common from '../common';

// Translation routine from slate to OLI JSON
export function toPersistence(value: Value, inlineText = false): Object {

  const root = { body: { '#array': [] } };

  root.body['#array'] = value.document.nodes
    .toArray()
    .map(node => translateNode(node as Block));

  return inlineText
    ? adjustInline(root)
    : root.body['#array'];
}

function translateNode(node: Block) {
  const content = [];
  node.nodes.forEach((n) => {
    if (n.object === 'text' && n.text.length > 0) {
      handleText(n, content);
    } else if (n.object === 'inline') {
      handleInline(n, content);
    }
  });
  return { p: { '#array': content } };
}

function handleText(node: Text, content) {

  // Handle the simple case of no marks first
  if (node.marks.size === 0) {
    content.push({ '#text': node.text });
  } else {
    handleMarkedText(node, content);
  }
}

function handleMarkedText(node: Text, content) {
  const marks = node.marks.toArray().map(m => m.type);

  // if bdo is present, it must be first
  const adjusted = marks.includes('bdo')
    ? ['bdo', ...marks.filter(m => m !== 'bdo')]
    : marks;

  const root = { root: {} };
  let last = root;

  adjusted.forEach((s) => {

    // For each style, create the object representation for that style
    if (s !== undefined) {
      const container = styleContainers[s];
      let style;
      if (container === undefined) {
        style = Object.assign({}, styleContainers.em());
      } else {
        style = Object.assign({}, container());
      }

      // Now root this style object into the parent style
      const key = common.getKey(last);
      last[key][common.getKey(style)] = style[common.getKey(style)];
      last = style;
    }
  });

  // Set the text on the last one, add the tree to the container
  last[common.getKey(last)]['#text'] = node.text;
  content.push(root.root);

}

function handleInline(node: Inline, content) {
  if (inlineHandlers[node.type] !== undefined) {
    inlineHandlers[node.type](node, content);
  }
}

// Remove the outer paragraph from inline text
function adjustInline(root) {
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
  em: () => ({ em: { '@style': 'bold' } }),
  italic: () => ({ em: { '@style': 'italic' } }),
  deemphasis: () => ({ em: { '@style': 'deemphasis' } }),
  highlight: () => ({ em: { '@style': 'highlight' } }),
  strikethrough: () => ({ em: { '@style': 'line-through' } }),
  oblique: () => ({ em: { '@style': 'oblique' } }),
  var: () => ({ var: {} }),
  term: () => ({ term: {} }),
  bdo: () => ({ bdo: {} }),
  ipa: () => ({ ipa: {} }),
  foreign: () => ({ foreign: {} }),
  sub: () => ({ sub: {} }),
  sup: () => ({ sup: {} }),
};


const inlineHandlers = {
  link: contentBasedInline,
  xref: contentBasedInline,
  activity_link: contentBasedInline,
  quote: contentBasedInline,
  code: contentBasedInline,
  'm:math': terminalInline,
  '#math': terminalInline,
  extra,
  image: terminalInline,
  sym: terminalInline,
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

function extra(i: Inline, container) {
  const item = i.data.get('value').toPersistence();

  const anchor = { anchor: { '#array': [] } };
  const arr = anchor.anchor['#array'];

  i.nodes.forEach((node) => {
    const textNode = node as Text;
    handleText(textNode, arr);
  });

  // Replace the serialized anchor with the latest
  // from the slate nodes
  item.extra['#array'][0] = anchor;
  container.push(item);

}


