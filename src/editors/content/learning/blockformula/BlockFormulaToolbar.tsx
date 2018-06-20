import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { InlineStyles } from 'data/content/learning/contiguous';
import { EntityTypes } from 'data/content/learning/common';
import { getEditorByContentType } from 'editors/content/container/registry';
import { TextSelection } from 'types/active';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import { styles } from './BlockFormula.styles';

export interface BlockFormulaToolbarProps
  extends AbstractContentEditorProps<contentTypes.BlockFormula> {
  selection: TextSelection;
}

export interface BlockFormulaToolbarState {

}

@injectSheet(styles)
export default class BlockFormulaToolbar
  extends AbstractContentEditor<contentTypes.BlockFormula,
  BlockFormulaToolbarProps & JSSProps, BlockFormulaToolbarState> {

  constructor(props) {
    super(props);
  }

  renderActiveEntity(entity) {

    const { key, data } = entity;

    const props = {
      ...this.props,
      renderContext: RenderContext.Sidebar,
      onFocus: (c, p) => true,
      model: data,
      onEdit: (updated) => {
        const text = this.props.model.text.updateEntity(key, updated);
        this.props.onEdit(this.props.model.with({ text }), updated);
      },
    };

    return React.createElement(
      getEditorByContentType((data as any).contentType), props);

  }

  renderSidebar() {
    const { model, selection } = this.props;

    const entity = selection.isCollapsed()
      ? model.text.getEntityAtCursor(selection).caseOf({ just: n => n, nothing: () => null })
      : null;

    if (entity !== null) {
      return this.renderActiveEntity(entity);
    }
    return <SidebarContent title="Formula" />;
  }

  renderToolbar() {

    const { model, onEdit, editMode, selection } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);
    const noTextSelected = selection && selection.isCollapsed();

    const cursorInEntity = selection && selection.isCollapsed()
      ? model.text.getEntityAtCursor(selection).caseOf({ just: n => true, nothing: () => false })
      : false;

    const pointEntitiesEnabled = editMode && !cursorInEntity && noTextSelected;

    return (
      <ToolbarGroup
        label="Formula" highlightColor={CONTENT_COLORS.BlockFormula} columns={5.4}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={
              () => onEdit(model.with({
                text: model.text.toggleStyle(InlineStyles.Bold, selection),
              }))
            }
            disabled={noTextSelected || !editMode}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.with({
                text: model.text.toggleStyle(InlineStyles.Italic, selection),
              }))
            }
            disabled={noTextSelected || !editMode}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.with({
                text: model.text.toggleStyle(InlineStyles.Strikethrough, selection),
              }))
            }
            disabled={noTextSelected || !editMode}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.with({
                text: model.text.toggleStyle(InlineStyles.Highlight, selection),
              }))
            }
            disabled={noTextSelected || !editMode}
            tooltip="Highlight">
            <i className={'fa fa-pencil'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.with({
                text: model.text.toggleStyle(InlineStyles.Superscript, selection),
              }))
            }
            disabled={noTextSelected || !editMode}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.with({
                text: model.text.toggleStyle(InlineStyles.Subscript, selection),
              }))
            }
            disabled={noTextSelected || !editMode}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.with({
                  text: model.text.addEntity(
                    EntityTypes.math, true, new contentTypes.Math(), selection),
                }));
              }
            }
            disabled={!supports('m:math') || !pointEntitiesEnabled}
            tooltip="MathML or Latex formula">
            <i className={'fa fa-etsy'} />
          </ToolbarButton>
        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return null;
  }
}
