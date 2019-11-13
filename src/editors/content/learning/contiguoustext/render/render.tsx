import { Editor } from 'slate';
import './styles.scss';
import { Extra } from './Extra';
import { MathDisplay } from './Math';
import { InputRefDisplay } from './InputRefDisplay';
import { tip } from './common';
import { ImageDisplay } from './Image';
import { SymDisplay } from './Sym';
import { CiteDisplay } from './Cite';

// Slate plugin to allow Ctrl plus a character to
// toggle character styling
export function markHotkey(options) {
  const { type, key } = options;

  return {
    onKeyDown(event, editor, next) {
      // If it doesn't match our `key`, let other plugins handle it.
      if (!(event.ctrlKey || event.metaKey) || event.key !== key) return next();

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
    case 'foreign':
      return <em>{props.children}</em>;
    case 'ipa':
      return <em>{props.children}</em>;
    case 'bdo':
      return <bdo dir="rtl">{props.children}</bdo>;
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
  const { onInlineClick, context, parentProps, parent } = extras;
  const { attributes, children, node } = props;

  const onClick = (e) => {
    e.preventDefault();
    onInlineClick(node);
  };

  const standardProps = {
    context,
    attrs: attributes,
    onClick,
    node,
    editor,
  };

  switch (node.type) {
    case 'Cite':
      return <CiteDisplay {...standardProps} />;
    case 'Code':
      return <code {...attributes}>{children}</code>;
    case 'Link': {
      return tip('External Hyperlink', 'oli-link', attributes, children);
    }
    case 'Command': {
      return tip('Command', 'oli-command', attributes, children);
    }
    case 'Xref': {
      return tip('Cross reference', 'oli-link', attributes, children);
    }
    case 'ActivityLink': {
      return tip('Activity link', 'oli-link', attributes, children);
    }
    case 'Extra': {
      return <Extra
        {...standardProps}
        parent={parent}
        parentProps={parentProps}>{children}</Extra>;
    }
    case 'Sym': {
      return <SymDisplay {...standardProps} />;
    }
    case 'Image': {
      return <ImageDisplay {...standardProps} />;
    }
    case 'InputRef': {
      return <InputRefDisplay {...standardProps} />;
    }
    case 'Math': {
      return <MathDisplay {...standardProps} />;
    }
    case 'Quote': {
      return <span {...attributes}>&quot;{children}&quot;</span>;
    }

    default: {
      return next();
    }
  }
}
