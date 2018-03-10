import * as React from 'react';
import { ComponentProps } from 'types/component';
import * as contentTypes from 'data/contentTypes';
import { InlineStyles } from 'data/content/learning/contiguous';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton } from './ToolbarButton';
import { Maybe } from 'tsmonad';

export interface FormatToolbarProps {
  content: Maybe<Object>;
  isText: boolean;
  onEdit: (content: Object) => void;
}

/**
 * FormatToolbar React Stateless Component
 */
export const FormatToolbar = (({
  onEdit, isText, content,
}: ComponentProps<FormatToolbarProps>) => {
  return (
    <React.Fragment>
      <ToolbarLayout.Inline>
        <ToolbarButton
            onClick={
              () => content.lift((t) => {
                const text = t as contentTypes.ContiguousText;
                onEdit(text.toggleStyle(InlineStyles.Bold));
              })
            }
            tooltip="Bold"
            disabled={!isText}>
          <i className={'fa fa-bold'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={
              () => content.lift((t) => {
                const text = t as contentTypes.ContiguousText;
                onEdit(text.toggleStyle(InlineStyles.Italic));
              })
            }
            tooltip="Italic"
            disabled={!isText}>
          <i className={'fa fa-italic'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={
              () => content.lift((t) => {
                const text = t as contentTypes.ContiguousText;
                onEdit(text.toggleStyle(InlineStyles.Strikethrough));
              })
            }
            tooltip="Strikethrough"
            disabled={!isText}>
          <i className={'fa fa-strikethrough'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={
              () => content.lift((t) => {
                const text = t as contentTypes.ContiguousText;
                onEdit(text.toggleStyle(InlineStyles.Highlight));
              })
            }
            tooltip="Highlight"
            disabled={!isText}>
          <i className={'fa fa-pencil'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={
              () => content.lift((t) => {
                const text = t as contentTypes.ContiguousText;
                onEdit(text.toggleStyle(InlineStyles.Superscript));
              })
            }
            tooltip="Superscript"
            disabled={!isText}>
          <i className={'fa fa-superscript'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={
              () => content.lift((t) => {
                const text = t as contentTypes.ContiguousText;
                onEdit(text.toggleStyle(InlineStyles.Subscript));
              })
            }
            tooltip="Subscript"
            disabled={!isText}>
          <i className={'fa fa-subscript'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={
              () => content.lift((t) => {
                const text = t as contentTypes.ContiguousText;
                onEdit(text.toggleStyle(InlineStyles.Code));
              })
            }
            tooltip="Code"
            disabled={!isText}>
          <i className={'fa fa-code'}/>
        </ToolbarButton>
      </ToolbarLayout.Inline>
    </React.Fragment>
  );
});
