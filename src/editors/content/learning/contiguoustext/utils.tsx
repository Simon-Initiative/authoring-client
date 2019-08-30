// Slate.js specific rendering utilities
import { Math as MathRenderer } from 'utils/math/Math';
import * as ct from 'data/contentTypes';
import { InputRefType } from 'data/content/learning/input_ref';
import './styles.scss';

const IMAGE = require('../../../../../assets/400x300.png');
import { buildUrl } from '../../../../utils/path';

import { Tooltip } from 'utils/tooltip';

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
    case 'code':
      return <code>{props.children}</code>;
    case 'link': {
      return tip('External Hyperlink', 'oli-link', children);
    }
    case 'command': {
      return tip('Command', 'oli-command', children);
    }
    case 'xref': {
      return tip('Cross reference', 'oli-link', children);
    }
    case 'activity_link': {
      return tip('Activity link', 'oli-link', children);
    }
    case 'extra': {
      return tip('Rollover definition', 'oli-extra', children);
    }
    case 'sym': {

    }
    case 'image': {

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
    case 'input': {
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
    case 'math': {
      const { data } = node.value as ct.Math;
      return (
        <MathRenderer inline >{data}</MathRenderer>
      );
    }
    case 'quote': {
      return (
        <span>&quot;{children}&quot;</span>
      );
    }

    default: {
      return next();
    }
  }
}
