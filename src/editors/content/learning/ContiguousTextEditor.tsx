import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps } from 'styles/jss';
import DraftWrapper from 'editors/content/common/draft/DraftWrapper';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { InlineStyles } from 'data/content/learning/contiguous';
import { EntityTypes } from 'data/content/learning/common';
import { getEditorByContentType } from 'editors/content/container/registry';

import colors from 'styles/colors';
import styles from './ContiguousTextEditor.styles';

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {

}

export interface ContiguousTextEditorState {


}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText,
    ContiguousTextEditorProps & JSSProps, ContiguousTextEditorState> {

  constructor(props) {
    super(props);

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
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
    const { model } = this.props;

    const entity = model.selection.isCollapsed()
      ? model.getEntityAtCursor().caseOf({ just: n => n, nothing: () => null })
      : null;

    if (entity !== null) {
      return this.renderActiveEntity(entity);
    }
    return <SidebarContent title="Text Block" isEmpty />;
  }

  renderToolbar() {

    const { model, onEdit, editMode } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);

    const noTextSelected = model.selection.isCollapsed();

    const bareTextSelected = model.selection.isCollapsed()
      ? false
      : !model.selectionOverlapsEntity();

    const cursorInEntity = model.selection.isCollapsed()
      ? model.getEntityAtCursor().caseOf({ just: n => true, nothing: () => false })
      : false;

    const rangeEntitiesEnabled = editMode && bareTextSelected;
    const pointEntitiesEnabled = editMode && !cursorInEntity && noTextSelected;

    return (
      <ToolbarGroup
        label="Text Block" highlightColor={colors.contentSelection}>
        <ToolbarLayout.Inline>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Bold))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Bold">
            <i className={'fa fa-bold'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Italic))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Italic">
            <i className={'fa fa-italic'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Strikethrough))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Highlight))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Highlight">
            <i className={'fa fa-pencil'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Superscript))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Superscript">
            <i className={'fa fa-superscript'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Subscript))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Subscript">
            <i className={'fa fa-subscript'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => onEdit(model.toggleStyle(InlineStyles.Code))
              }
              disabled={noTextSelected || !editMode}
              tooltip="Code">
            <i className={'fa fa-code'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Term));
              }}
              disabled={noTextSelected || !editMode}
              tooltip="Term">
            <i className={'fa fa-book'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Foreign));
              }}
              disabled={noTextSelected || !editMode}
              tooltip="Foreign">
            <i className={'fa fa-globe'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.math, true, new contentTypes.Math()));
                }
              }
              disabled={!supports('m:math') || !pointEntitiesEnabled}
              tooltip="MathML or Latex formula">
            <i className={'fa fa-etsy'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.quote, true, new contentTypes.Quote()));
                }
              }
              disabled={!supports('quote') || !rangeEntitiesEnabled}
              tooltip="Quotation">
            <i className={'fa fa-quote-right'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.cite, true, new contentTypes.Cite()));
                }
              }
              disabled={!supports('cite') || !rangeEntitiesEnabled}
              tooltip="Citation">
            <i className={'fa fa-asterisk'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.link, true, new contentTypes.Link()));
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
                    EntityTypes.activity_link, true, new contentTypes.ActivityLink()));
                }
              }
              disabled={!supports('activity_link') || !rangeEntitiesEnabled}
              tooltip="High Stakes Assessment Link">
            <i className={'fa fa-check'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.xref, true, new contentTypes.Xref()));
                }
              }
              disabled={!supports('xref') || !rangeEntitiesEnabled}
              tooltip="Cross Reference Link">
            <i className={'fa fa-map-signs'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Ordered List">
            <i className={'fa fa-list-ol'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Unordered List">
            <i className={'fa fa-list-ul'}/>
          </ToolbarButton>
        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {

    const ignoreSelection = () => {};

    const { classes } = this.props;

    return (
      <div className={classes.contiguousText}>

          <DraftWrapper
            activeItemId=""
            editorStyles={{}}
            onSelectionChange={ignoreSelection}
            services={this.props.services}
            context={this.props.context}
            content={this.props.model}
            undoRedoGuid={this.props.context.undoRedoGuid}
            locked={!this.props.editMode}
            onEdit={c => this.props.onEdit(c, c)} />

      </div>);
  }

}

