// Slate.js specific rendering utilities
import { Math as MathRenderer } from 'utils/math/Math';
import * as ct from 'data/contentTypes';
import { InputRefType } from 'data/content/learning/input_ref';
import './styles.scss';
import { Editor, Inline, Value, Document } from 'slate';
const IMAGE = require('../../../../../assets/400x300.png');
import { buildUrl } from '../../../../utils/path';
import { InlineTypes } from 'data/content/learning/contiguous';
import { Tooltip } from 'utils/tooltip';


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

function removeInline(editor: Editor, key: string): Editor {
  return editor.removeNodeByKey(key);
}

function insertInline(editor: Editor, data: InlineTypes): Editor {
  const inline = Inline.create({ data, type: data.contentType });
  return editor.insertInline(inline);
}

function applyInline(editor: Editor, wrapper: InlineTypes): Editor {
  return editor.command(wrapInlineWithData, wrapper);
}

// Split the value of an active editor at its current selection
// and create two Value objects as a result.
function split(editor: Editor): ValuePair {

  // Note the key of the block in the selection
  // that will appear chronologically first in the content
  const anchorKey = editor.value.selection.isBackward
    ? editor.value.selection.anchor.key
    : editor.value.selection.focus.key;

  // Count the ordinal position of that block within the node list
  let anchorPosition = 0;
  editor.value.document.nodes.toArray().forEach((n, i) => {
    if (n.key === anchorKey) {
      anchorPosition = i;
    }
  });

  // Now split the block at the current selection
  const updated = editor.splitBlock();

  // With the resultant split structure, create two value objects,
  // one with the blocks from before the split, and one with the
  // blocks after the split
  const document = updated.value.document;
  const value = updated.value;
  const nodes1 = updated.value.document.nodes.takeWhile(b => b.key === anchorKey);
  const nodes2 = updated.value.document.nodes.toArray().slice(anchorPosition + 1);

  return [
    value.merge({ document: document.merge({ nodes: nodes1 }) as Document }) as Value,
    value.merge({ document: document.merge({ nodes: nodes2 }) as Document }) as Value,
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
  markHotkey({ key: '~', type: 'strikethrough' }),
  markHotkey({ key: 'h', type: 'highlight' }),
];

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
    case 'strikethrough':
      return <del>{props.children}</del>;
    case 'highlight':
      return <mark>{props.children}</mark>;
    default:
      return next();
  }
}

// Slate inline rendering
export function renderInline(extras, props, editor, next) {
  const { onDecoratorClick, context } = extras;
  const { attributes, children, node } = props;
  const { data } = node;

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
      return tip('Rollover definition', 'oli-extra', children);
    }
    case 'Sym': {

    }
    case 'Image': {

      const src = data.value.src;

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
        onClick={(e) => {
          e.stopPropagation();
          onDecoratorClick(this.props.entityKey);
        }}
        src={fullSrc}
        height={data.height}
        width={data.width} />;
    }
    case 'InputRef': {
      const type = data.value.inputType;
      if (type === InputRefType.Numeric) {
        return <input readOnly value="Numeric" size={15} />;
      }
      if (type === InputRefType.Numeric) {
        return <input readOnly value="Text" size={15} />;
      }
      if (type === InputRefType.Numeric) {
        return <select size={15} />;
      }

    }
    case 'Math': {
      const { data } = node.value as ct.Math;
      return (
        <MathRenderer inline >{data}</MathRenderer>
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
