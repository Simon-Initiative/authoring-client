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

import colors from 'styles/colors';
import styles from './ContiguousTextEditor.styles';

export interface ContiguousTextToolbarProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {

  selection: TextSelection;
}

export interface ContiguousTextToolbarState {


}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class ContiguousTextToolbar
  extends AbstractContentEditor<contentTypes.ContiguousText,
    ContiguousTextToolbarProps & JSSProps, ContiguousTextToolbarState> {

  constructor(props) {
    super(props);

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    if (nextProps.selection.getRawSelectionState()
      !== this.props.selection.getRawSelectionState()) {
      return true;
    }
    return false;
  }

  renderActiveEntity(entity) {

    const { key, data } = entity;

    const props = {
      ...this.props,
      renderContext: RenderContext.Sidebar,
      onFocus: (c, p) => true,
      model: data,
      onEdit: (updated) => {
        this.props.onEdit(this.props.model.updateEntity(key, updated));
      },
    };

    return React.createElement(
      getEditorByContentType((data as any).contentType), props);

  }

  renderSidebar() {
    const { model, selection } = this.props;

    const entity = selection.isCollapsed()
      ? model.getEntityAtCursor(selection).caseOf({ just: n => n, nothing: () => null })
      : null;

    if (entity !== null) {
      return this.renderActiveEntity(entity);
    }
    return <SidebarContent title="Text Block" isEmpty />;
  }

  renderToolbar() {

    const { model, onEdit, editMode, selection } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);

    const noTextSelected = selection.isCollapsed();

    const bareTextSelected = selection.isCollapsed()
      ? false
      : !model.selectionOverlapsEntity(selection);

    const cursorInEntity = selection.isCollapsed()
      ? model.getEntityAtCursor(selection).caseOf({ just: n => true, nothing: () => false })
      : false;

    const rangeEntitiesEnabled = editMode && bareTextSelected;
    const pointEntitiesEnabled = editMode && !cursorInEntity && noTextSelected;

    return (
      <ToolbarGroup
        label="Text Block" highlightColor={CONTENT_COLORS.ContiguousText}>
        <ToolbarLayout.Inline>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Bold, selection))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Bold">
            <i className={'fa fa-bold'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Italic, selection))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Italic">
            <i className={'fa fa-italic'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Strikethrough, selection))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Highlight, selection))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Highlight">
            <i className={'fa fa-pencil'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Superscript, selection))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Superscript">
            <i className={'fa fa-superscript'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Subscript, selection))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Subscript">
            <i className={'fa fa-subscript'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Code, selection))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Code">
            <i className={'fa fa-code'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Term, selection));
              }}
              disabled={noTextSelected || !editMode}
              tooltip="Term">
            <i className={'fa fa-book'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Foreign, selection));
              }}
              disabled={noTextSelected || !editMode}
              tooltip="Foreign">
            <i className={'fa fa-globe'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(
                    EntityTypes.math, true, new contentTypes.Math(), selection));
                }
              }
              disabled={!supports('m:math') || !pointEntitiesEnabled}
              tooltip="MathML or Latex formula">
            <i className={'fa fa-etsy'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(
                    EntityTypes.quote, true, new contentTypes.Quote(), selection));
                }
              }
              disabled={!supports('quote') || !rangeEntitiesEnabled}
              tooltip="Quotation">
            <i className={'fa fa-quote-right'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(
                    EntityTypes.cite, true, new contentTypes.Cite(), selection));
                }
              }
              disabled={!supports('cite') || !rangeEntitiesEnabled}
              tooltip="Citation">
            <i className={'fa fa-asterisk'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(
                    EntityTypes.link, true, new contentTypes.Link(), selection));
                }
              }
              disabled={!supports('link') || !rangeEntitiesEnabled}
              tooltip="External Hyperlink">
            <i className={'fa fa-external-link'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(
                    EntityTypes.activity_link, true, new contentTypes.ActivityLink(), selection));
                }
              }
              disabled={!supports('activity_link') || !rangeEntitiesEnabled}
              tooltip="High Stakes Assessment Link">
            <i className={'fa fa-check'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(
                    EntityTypes.xref, true, new contentTypes.Xref(), selection));
                }
              }
              disabled={!supports('xref') || !rangeEntitiesEnabled}
              tooltip="Cross Reference Link">
            <i className={'fa fa-map-signs'}/>
          </ToolbarButton>

        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {
    return null;
  }

}

