import * as Immutable from 'immutable';
import * as ct from 'data/contentTypes';
import { Editor, Inline, Text, Value, Block, Document, Mark, Range, Node } from 'slate';
import { Maybe } from 'tsmonad';
import { InlineStyles, InlineTypes } from 'data/content/learning/contiguous';
import guid from 'utils/guid';

export type ValuePair = [Value, Value];

export function isCursorInText(editor: Editor): boolean {
  return editor.value.selection.isFocused;
}

// Helper routine to turn the current selection into an inline
function wrapInlineWithData(editor, wrapper) {
  editor.wrapInline({
    type: wrapper.contentType,
    data: { value: wrapper },
  });

  editor.moveToEnd();
}

// Remove the inline specified by the given key
export function removeInline(editor: Editor, key: string): Editor {
  return editor.removeNodeByKey(key);
}

// Inserting an inline adds an inline as new content
export function insertInline(editor: Editor, wrapper: InlineTypes): Editor {
  const inline = Inline.create({ data: { value: wrapper }, type: wrapper.contentType });
  return editor.insertInline(inline);
}

// Applying an inline turns the current selection into an inline
export function applyInline(editor: Editor, wrapper: InlineTypes): Editor {
  return editor.command(wrapInlineWithData, wrapper);
}

// Returns true if the slate editor contains one block and
// the text in that block is empty or contains all spaces
export function isEffectivelyEmpty(editor: Editor): boolean {
  const nodes = editor.value.document.nodes;
  return nodes.size === 1
    && nodes.get(0).object === 'text'
    && nodes.get(0).text.trim() === '';
}

// Returns true if the selection is collapsed and the cursor is
// positioned in the last block and no text other than spaces
// follows the cursor
export function isCursorAtEffectiveEnd(editor: Editor): boolean {
  const node = (editor.value.document.nodes
    .get(editor.value.document.nodes.size - 1) as Block);
  const { key, text } = node;

  const selection = editor.value.selection;

  return selection.isCollapsed
    && key === selection.anchor.key
    && text.trim().length <= selection.anchor.offset;
}

// Returns true if the selection is collapsed and is at the
// very beginning of the first block
export function isCursorAtBeginning(editor: Editor): boolean {
  const key = (editor.value.document.nodes.get(0) as Block).key;
  const selection = editor.value.selection;
  return selection.isCollapsed
    && key === selection.anchor.key
    && selection.anchor.offset === 0;
}

// Find a specific node by its key
function findNodeByKey(editor: Editor, key: string): Maybe<Inline | Text | Block> {
  const predicate = b => b.key === key;
  return findNodeByPredicate(editor, predicate);
}

// Find an input ref inline by its input attribute
function findInputRef(editor: Editor, input: string): Maybe<Inline | Text | Block> {
  const predicate = b => b.object === 'inline'
    && b.data.get('value').contenType === 'InputRef'
    && b.data.get('value').input === input;
  return findNodeByPredicate(editor, predicate);
}

// Flexible find a node by a supplied predicate
function findNodeByPredicate(editor: Editor,
  predicate: (node: Inline | Text | Block) => boolean): Maybe<Inline | Text | Block> {

  return dfs(editor.value.document.nodes as Immutable.List<Inline | Text | Block>);

  function dfs(nodes: Immutable.List<Inline | Text | Block>) {
    if (nodes.size === 0) {
      return Maybe.nothing<Inline | Text | Block>();
    }
    const first = nodes.first();
    if (predicate(first)) {
      return Maybe.just(first);
    }
    // Text nodes are always leaves
    if (Text.isText(first)) {
      return dfs(nodes.rest().toList());
    }
    return dfs(first.nodes.concat(nodes.rest().toList()).toList());
  }
}

// Find a collection of nodes based on a predicate
function findNodesByPredicate(editor: Editor,
  predicate: (node: Block | Inline | Text) => boolean): Immutable.List<Inline | Text | Block> {

  const found = [];
  const nodes = editor.value.document.nodes.toArray();
  for (let i = 0; i < nodes.length; i += 1) {
    const b = nodes[i] as Block;
    if (predicate(b)) {
      found.push(b);
    }
    const inner = b.nodes.toArray();
    for (let j = 0; j < inner.length; j += 1) {
      const m = inner[j];
      if (predicate(m)) {
        found.push(m);
      }
      if (m.object === 'inline') {
        const inlines = m.nodes.toArray();
        for (let k = 0; k < inlines.length; k += 1) {
          const inlineNode = inlines[k];
          if (predicate(inlineNode)) {
            found.push(inlineNode);
          }
        }
      }
    }
  }
  return Immutable.List(found);
}

// For an inline specified by a given key, update its data wrapper
// with the supplied wrapper
export function updateInlineData(editor: Editor, key: string, wrapper: InlineTypes): Editor {

  const selection = editor.value.selection;

  return findNodeByKey(editor, key).caseOf({
    just: (n) => {
      if (n.object === 'inline') {
        return editor
          .replaceNodeByKey(key, n.merge({ data: { value: wrapper } }) as Inline)
          .select(selection);
      }
      return editor;
    },
    nothing: () => editor,
  });

}

export function toggleMark(e: Editor, style: InlineStyles) {
  e.toggleMark(style)
    .focus();
}

// Helper to determine if a selection is not collapsed and
// that only bare (i.e. non inline) text is selected
export function bareTextSelected(editor: Maybe<Editor>): boolean {
  return editor.caseOf({
    just: (e) => {

      if (e.value.selection.isCollapsed) {
        return false;
      }
      const s = e.value.selection;
      const range = new Range({ anchor: s.anchor, focus: s.focus });
      return e.value.document.getLeafInlinesAtRange(range).size === 0;
    },
    nothing: () => false,
  });
}

// Helper to determine if no text is selected
export function noTextSelected(editor: Maybe<Editor>): boolean {
  return editor.caseOf({
    just: e => e.value.selection.isCollapsed,
    nothing: () => false,
  });
}

// Is the current selection inside an inline?
export function cursorInEntity(editor: Maybe<Editor>): boolean {
  return editor.caseOf({
    just: e => getInlineAtCursor(e).caseOf({
      just: i => true,
      nothing: () => false,
    }),
    nothing: () => false,
  });
}

// Accesses the plain text from a selection with a single
// paragraph of continguous text.  If the selection spans
// multiple content blocks (i.e. paragraphs) we return Nothing. If
// the block is not found or the selection offsets exceed the
// length of the raw text for the block, we return nothing.
// Otherwise, we return just the raw underlying text substring.

export function extractParagraphSelectedText(editor: Maybe<Editor>): Maybe<string> {
  return editor.caseOf({
    just: (e) => {
      const selection = e.value.selection;
      if (selection.isCollapsed || selection.anchor.key !== selection.focus.key) {
        return Maybe.nothing();
      }
      const from = selection.isBackward
        ? selection.anchor.offset
        : selection.focus.offset;
      const to = selection.isBackward
        ? selection.focus.offset
        : selection.anchor.offset;

      return findNodeByKey(e, selection.anchor.key).caseOf({
        just: (n) => {
          return Maybe.just((n.text as string).substring(from, to));
        },
        nothing: () => Maybe.nothing(),
      });

    },
    nothing: () => Maybe.nothing(),
  });
}

export function currentMarks(editor: Editor) {
  return editor.value.marks;
}

export function bdoDisabled(editor: Maybe<Editor>): boolean {

  // We enable the bdo button only when there is a selection that
  // doesn't overlap an entity, and that selection selects only
  // bare text or just another bdo
  return editor.caseOf({
    just: (e) => {
      const selection = e.value.selection;
      const currentMarks = selection.marks === null
        ? Immutable.Set<Mark>()
        : selection.marks;

      const onlyBdoOrEmpty = currentMarks.size === 0
        || (currentMarks.size === 1 && (currentMarks.map(m => m.type).contains('bdo')));
      const inline = getInlineAtCursor(e).caseOf({ just: n => true, nothing: () => false });

      return selection.isCollapsed
        || inline
        || !onlyBdoOrEmpty;
    },
    nothing: () => true,
  });

}

// Remove an inline
export function removeInlineEntity(editor: Editor, key: string): Editor {

  return findNodeByKey(editor, key).caseOf({
    just: (n) => {
      if (n.object === 'inline') {
        return editor
          .removeNodeByKey(key);
      }
      return editor;
    },
    nothing: () => editor,
  });

}

// Updates the wrappers for all input ref inlines
export function updateAllInputRefs(
  editor: Editor, itemMap: Object): Editor {

  const predicate = b => b.object === 'inline'
    && b.data.get('value').contenType === 'InputRef';
  const inputRefs = findNodesByPredicate(editor, predicate);

  return inputRefs.toArray().reduce(
    (editor, ref) => {
      const updated = itemMap[(ref as Inline).data.get('value').input];
      return updated !== undefined
        ? editor.replaceNodeByKey(ref.key, updated)
        : editor;
    },
    editor,
  );
}

// Remove an input ref given its input (item id) value
export function removeInputRef(editor: Editor, itemId: string): Editor {
  return findInputRef(editor, itemId).caseOf({
    just: n => editor.removeNodeByKey(n.key),
    nothing: () => editor,
  });
}

export function getBlockAtCursor(editor: Editor): Maybe<Block> {
  const s = editor.value.selection;

  if (s.anchor.key === null) {
    return Maybe.nothing();
  }
  if (s.anchor.key !== s.focus.key || !s.isCollapsed) {
    return Maybe.nothing();
  }

  const b = editor.value.document.nodes.get(s.anchor.path.get(0)) as Block;

  if (b === undefined) {
    return Maybe.nothing();
  }
  return Maybe.just(b);
}

export function getLeafAtCursor(editor: Editor): Maybe<Block | Text | Inline> {
  const selection = editor.value.selection;
  const atAnchor = findNodeByKey(editor, selection.anchor.key);
  const atEnd = findNodeByKey(editor, selection.end.key);
  const singleNodeSelected = atAnchor.valueOr(null) !== null
    && atAnchor.valueOr(null) === atEnd.valueOr(null);
  return singleNodeSelected ? atAnchor : Maybe.nothing();
}

// Access the inline present at the users current selection
export function getInlineAtCursor(editor: Editor): Maybe<Inline> {
  const s = editor.value.selection;
  return getBlockAtCursor(editor).lift((block) => {
    const inner = block.nodes.get(s.anchor.path.get(1));

    if (inner === undefined) {
      return undefined;
    }

    if (inner.object === 'inline') {
      return inner;
    }

    return undefined;
  });
}

const wrappers = {
  Cite: ct.Cite,
  Command: ct.Command,
  Link: ct.Link,
  Xref: ct.Xref,
  ActivityLink: ct.ActivityLink,
  Quote: ct.Quote,
  Code: ct.Code,
  Math: ct.Math,
  Extra: ct.Extra,
  Image: ct.Image,
  Sym: ct.Sym,  //
  InputRef: ct.InputRef, // strip
};

const construct = Immutable.Set<string>(
  ['Command', 'Xref', 'ActivityLink', 'Quote', 'Code', 'Math', 'Image', 'Sym']);

function reapply(node) {

  const rawValue = node.data.get('value');
  const { contentType } = rawValue;

  // Simple rehydration into wrapper
  if (construct.has(contentType)) {
    const value = new wrappers[contentType](rawValue);
    const data = { value };
    return node.merge({ data });
  }

  // Handle Links
  if (contentType === 'Link') {
    delete rawValue.content;
    const value = new wrappers[contentType]().with(rawValue);
    const data = { value };
    return node.merge({ data });
  }

  // Cite, Extra, InputRef (or anthing else) just gets
  // stripped out and replaced with a text node
  return Text.create({ text: node.text });
}

// Pre-processes slate fragments prior to allowing them to be pated.
// 1. Reapplies all wrappers that have been turned into
// plain javascript objects as the result of a paste operation.
// 2. Changes the ids for all paragraphs
export function adjustForPasting(node) {

  if (node.object === 'document') {
    return node.merge(
      { nodes: node.nodes.map(n => adjustForPasting(n)).toList() });
  }
  if (node.object === 'block') {
    return node.merge({
      nodes: node.nodes.map(n => adjustForPasting(n)).toList(),
      data: { id: guid() },
    });
  }
  if (node.object === 'inline') {
    return reapply(node);
  }
  return node;

}

// Access the set of style names active in the current selection
export function getActiveStyles(e: Maybe<Editor>): Immutable.Set<string> {
  return e.caseOf({
    just: (editor: Editor) => {
      return editor.value.activeMarks.map(m => m.type).toSet();
    },
    nothing: () => Immutable.Set<string>(),
  });
}

// Split the value of an active editor at its current selection
// and create two Value objects as a result.
export function split(editor: Editor): ValuePair {

  // Note the key of the block in the selection
  // that will appear chronologically first in the content
  const anchor = editor.value.selection.isBackward
    ? editor.value.selection.anchor
    : editor.value.selection.focus;

  // Count the ordinal position of that block within the node list
  const anchorPosition = anchor.path.get(0);

  // Now split the block at the current selection
  const updated = editor.splitBlock();

  // With the resultant split structure, create two value objects,
  // one with the blocks from before the split, and one with the
  // blocks after the split
  const document = updated.value.document;
  const value = updated.value;
  const nodes1 = updated.value.document.nodes.toArray().slice(0, anchorPosition + 1);

  const nodes2 = updated.value.document.nodes.toArray().slice(anchorPosition + 1);

  // Give the new split block a different id
  nodes2[0] = nodes2[0].merge({ data: { id: guid() } }) as Block;

  return [
    value.merge({
      document: document.merge(
        { nodes: Immutable.List(nodes1) }) as Document,
    }) as Value,
    value.merge({
      document: document.merge(
        { nodes: Immutable.List(nodes2) }) as Document,
    }) as Value,
  ];
}

