// Slate.js specific rendering utilities
import * as Immutable from 'immutable';
import { Math as MathRenderer } from 'utils/math/Math';
import * as ct from 'data/contentTypes';
import './styles.scss';
import { Editor, Inline, Text, Value, Block, Document, Mark } from 'slate';
const IMAGE = require('../../../../../assets/400x300.png');
import { buildUrl } from '../../../../utils/path';
import { InlineTypes } from 'data/content/learning/contiguous';
import { Tooltip } from 'utils/tooltip';
import { Extra } from './Extra';
import { InputRefDisplay } from './InputRefDisplay';
import { Maybe } from 'tsmonad';
const LARR_ICON = require('../../../../../assets/lArr.png');
const LRARR_ICON = require('../../../../../assets/lrarr.png');
const LRHAR_ICON = require('../../../../../assets/lrhar.png');
const NOT_INDEP_ICON = require('../../../../../assets/not_indep.gif');
const RARR_ICON = require('../../../../../assets/rArr.png');
const RLARR_ICON = require('../../../../../assets/rlarr.png');
const VBAR_ICON = require('../../../../../assets/Vbar.png');

export type ValuePair = [Value, Value];

type StyledInlineProps = {
  children,
  textStyle: string,
  tooltip: string,
};
const TooltipInline = (props: StyledInlineProps) => {
  const { tooltip, textStyle, children } = props;
  return (
    <Tooltip title={tooltip} delay={1000} size="small" arrowSize="small">
      <a className={textStyle}>
        {children}
      </a>
    </Tooltip>
  );
};


function wrapInlineWithData(editor, wrapper) {
  editor.wrapInline({
    type: wrapper.contentType,
    data: { value: wrapper },
  });

  editor.moveToEnd();
}

export function removeInline(editor: Editor, key: string): Editor {
  return editor.removeNodeByKey(key);
}

export function insertInline(editor: Editor, wrapper: InlineTypes): Editor {
  const inline = Inline.create({ data: { value: wrapper }, type: wrapper.contentType });
  return editor.insertInline(inline);
}

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

function findNodeByKey(editor: Editor, key: string): Maybe<Inline | Text | Block> {
  const predicate = b => b.key === key;
  return findNodeByPredicate(editor, predicate);
}

function findInputRef(editor: Editor, input: string): Maybe<Inline | Text | Block> {
  const predicate = b => b.object === 'inline'
    && b.data.get('value').contenType === 'InputRef'
    && b.data.get('value').input === input;
  return findNodeByPredicate(editor, predicate);
}

function findNodeByPredicate(editor: Editor,
  predicate: (node: Block | Inline | Text) => boolean): Maybe<Inline | Text | Block> {

  const nodes = editor.value.document.nodes.toArray();
  for (let i = 0; i < nodes.length; i += 1) {
    const b = nodes[i] as Block;
    if (predicate(b)) {
      return Maybe.just(b);
    }
    const inner = b.nodes.toArray();
    for (let j = 0; j < inner.length; j += 1) {
      const m = inner[j];
      if (predicate(m)) {
        return Maybe.just(m);
      }
    }
  }
  return Maybe.nothing();
}

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

export function bareTextSelected(editor: Maybe<Editor>): boolean {
  return editor.caseOf({
    just: e => e.value.selection.isCollapsed
      ? false
      : getEntityAtCursor(e).caseOf({
        just: en => false,
        nothing: () => true,
      }),
    nothing: () => false,
  });
}

export function noTextSelected(editor: Maybe<Editor>): boolean {
  return editor.caseOf({
    just: e => e.value.selection.isCollapsed,
    nothing: () => false,
  });
}

export function cursorInEntity(editor: Maybe<Editor>): boolean {
  return editor.caseOf({
    just: e => getEntityAtCursor(e).caseOf({
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
      const inline = getEntityAtCursor(e).caseOf({ just: n => true, nothing: () => false });

      return selection.isCollapsed
        || inline
        || !onlyBdoOrEmpty;
    },
    nothing: () => true,
  });

}

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

export function removeInputRef(editor: Editor, itemId: string): Editor {
  return findInputRef(editor, itemId).caseOf({
    just: n => editor.removeNodeByKey(n.key),
    nothing: () => editor,
  });
}

export function getEntityAtCursor(editor: Editor): Maybe<Inline> {

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
  const inner = b.nodes.get(s.anchor.path.get(1));

  if (inner === undefined) {
    return Maybe.nothing();
  }

  if (inner.object === 'inline') {
    return Maybe.just(inner);
  }

  return Maybe.nothing();
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

function tip(tooltip: string, style: string, children: any) {
  return (
    <TooltipInline
      tooltip={tooltip}
      textStyle={style}>
      {children}
    </TooltipInline>
  );
}

// Slate plugin to allow Ctrl plus a character to
// toggle character styling
function markHotkey(options) {
  const { type, key } = options;

  return {
    onKeyDown(event, editor, next) {
      // If it doesn't match our `key`, let other plugins handle it.
      if (!event.ctrlKey || event.key !== key) return next();

      // Prevent the default characters from being inserted.
      event.preventDefault();

      // Toggle the mark `type`.
      editor.toggleMark(type);
    },
  };
}

export const plugins = [
  markHotkey({ key: 'b', type: 'em' }),
  markHotkey({ key: '`', type: 'code' }),
  markHotkey({ key: 'i', type: 'italic' }),
  markHotkey({ key: '~', type: 'line-through' }),
  markHotkey({ key: 'h', type: 'highlight' }),
];

export function renderBlock(props, editor, next) {
  const { node, attributes, children } = props;

  switch (node.type) {
    case 'paragraph':
      return <p {...attributes}>{children}</p>;
    default:
      return next();
  }
}

// Slate mark rendering
export function renderMark(props, editor, next) {
  switch (props.mark.type) {
    case 'sub':
      return <sub>{props.children}</sub>;
    case 'sup':
      return <sup>{props.children}</sup>;
    case 'em':
      return <strong>{props.children}</strong>;
    case 'term':
      return <span className="oli-term">{props.children}</span>;
    case 'var':
      return <span className="oli-var">{props.children}</span>;
    case 'italic':
      return <em>{props.children}</em>;
    case 'line-through':
      return <del>{props.children}</del>;
    case 'highlight':
      return <mark>{props.children}</mark>;
    default:
      return next();
  }
}

// Slate inline rendering
export function renderInline(extras, props, editor: Editor, next) {
  const { onInlineClick, context } = extras;
  const { attributes, children, node, parent } = props;
  const { data } = node;

  const onClick = () => {
    onInlineClick(node);
  };

  switch (node.type) {
    case 'Code':
      return <code>{props.children}</code>;
    case 'Link': {
      return tip('External Hyperlink', 'oli-link', children);
    }
    case 'Command': {
      return tip('Command', 'oli-command', children);
    }
    case 'Xref': {
      return tip('Cross reference', 'oli-link', children);
    }
    case 'ActivityLink': {
      return tip('Activity link', 'oli-link', children);
    }
    case 'Extra': {
      return <Extra
        entityKey={node.key}
        editor={editor}
        parent={parent}
        parentProps={props} />;
    }
    case 'Sym': {

      const sepStyle: any = {
        fontSize: '70%',
        color: '#c00',
        backgroundColor: 'inherit',
        fontWeight: 'bold',
        verticalAlign: 'sub',
      };

      const symbols = {
        amp: () => <span className="sym">&amp;</span>,
        mdash: () => <span className="sym">&mdash;</span>,
        equals: () => <span className="sym">&#61;</span>,
        ne: () => <span className="sym">&ne;</span>,
        lt: () => <span className="sym">&lt;</span>,
        le: () => <span className="sym">&le;</span>,
        gt: () => <span className="sym">&gt;</span>,
        ge: () => <span className="sym">&ge;</span>,
        larr: () => <span className="sym">&larr;</span>,
        lArr: () => <span className="sym"><img src={LARR_ICON} /></span>,
        lrarr: () => <span className="sym"><img src={LRARR_ICON} /></span>,
        lrhar: () => <span className="sym"><img src={LRHAR_ICON} /></span>,
        rarr: () => <span className="sym">&rarr;</span>,
        rArr: () => <span className="sym"><img src={RARR_ICON} /></span>,
        rlarr: () => <span className="sym"><img src={RLARR_ICON} /></span>,
        Vbar: () => <span className="sym"><img src={VBAR_ICON} /></span>,
        oslash: () => <span className="sym">&empty;</span>,
        not_indep: () => <span className="sym"><img height="11" width="18"
          src={NOT_INDEP_ICON} /></span>,
        set_by_interv: () => <span className="sym"><span style={sepStyle}>
          <sub>sep</sub></span></span>,
      };

      const sym = data.get('value');

      return (
        <span>
          {symbols[sym.name]()}
        </span>
      );
    }
    case 'Image': {

      const src = data.get('value').src;

      let fullSrc;
      if (src === undefined || src === null || src === '') {
        fullSrc = IMAGE;
      } else {
        fullSrc = buildUrl(
          context.baseUrl,
          context.courseModel.guid,
          context.resourcePath,
          src);
      }
      return <img
        onClick={onClick}
        src={fullSrc}
        height={data.height}
        width={data.width} />;
    }
    case 'InputRef': {
      return (
        <InputRefDisplay
          onClick={onClick.bind(this, node)}
          inputRef={data.get('value')}
        />
      );
    }
    case 'Math': {
      const math = data.get('value') as ct.Math;
      return (
        <MathRenderer onClick={onClick} inline >{math.data}</MathRenderer>
      );
    }
    case 'Quote': {
      return (
        <span>&quot;{children}&quot;</span>
      );
    }

    default: {
      return next();
    }
  }
}
