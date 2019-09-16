import { Tooltip } from 'utils/tooltip';
import { Inline, Editor } from 'slate';
import { AppContext } from 'editors/common/AppContext';

export type InlineDisplayProps = {
  context: AppContext;
  editor: Editor;
  node: Inline;
  attrs,
  children?,
  onClick: (e) => void;
};

export type StyledInlineProps = {
  attrs,
  children,
  textStyle: string,
  tooltip: string,
};
export const TooltipInline = (props: StyledInlineProps) => {
  const { attrs, tooltip, textStyle, children } = props;
  return (
    <Tooltip title={tooltip} delay={1000} size="small" arrowSize="small">
      <a {...attrs} className={textStyle}>
        {children}
      </a>
    </Tooltip>
  );
};

export function tip(tooltip: string, style: string, attrs: any, children: any) {
  return (
    <TooltipInline
      attrs={attrs}
      tooltip={tooltip}
      textStyle={style}>
      {children}
    </TooltipInline>
  );
}
