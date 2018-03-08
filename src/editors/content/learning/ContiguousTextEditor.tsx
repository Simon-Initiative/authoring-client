import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import DraftWrapper from 'editors/content/common/draft/DraftWrapper';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarLayoutInline } from 'components/toolbar/ContextAwareToolbar.tsx';
import { InlineStyles } from 'data/content/learning/contiguous';
import { EntityTypes } from 'data/content/learning/common';
import { getEditorByContentType } from 'editors/content/container/registry';

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {

}

export interface ContiguousTextEditorState {


}

/**
 * The content editor for contiguous text.
 */
export default class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText,
    ContiguousTextEditorProps, ContiguousTextEditorState> {

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
    const { model, onEdit, editMode } = this.props;

    const entity = model.selection.isCollapsed()
      ? model.getEntityAtCursor().caseOf({ just: n => n, nothing: () => null })
      : null;

    if (entity !== null) {
      return this.renderActiveEntity(entity);
    }
    return null;
  }

  renderToolbar() {
    const { model, onEdit, editMode } = this.props;

    const entitiesDisabled = model.selection.isCollapsed()
      ? model.getEntityAtCursor().caseOf({ just: n => true, nothing: () => false })
      : model.selectionOverlapsEntity();

    return (
      <React.Fragment>
        <ToolbarLayoutInline>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Term));
              }}
              tooltip="Term">
            <i className={'fa fa-book'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={() => {
                onEdit(model.toggleStyle(InlineStyles.Foreign));
              }}
              tooltip="Foreign">
            <i className={'fa fa-globe'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.quote, true, new contentTypes.Quote()));
                }
              }
              disabled={entitiesDisabled}
              tooltip="Quotation">
            <i className={'fa fa-quote-right'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.cite, true, new contentTypes.Cite()));
                }
              }
              disabled={entitiesDisabled}
              tooltip="Citation">
            <i className={'fa fa-asterisk'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.link, true, new contentTypes.Link()));
                }
              }
              disabled={entitiesDisabled}
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
              disabled={entitiesDisabled}
              tooltip="High Stakes Assessment Link">
            <i className={'fa fa-check'}/>
          </ToolbarButton>
          <ToolbarButton
              onClick={
                () => {
                  onEdit(model.addEntity(EntityTypes.xref, true, new contentTypes.Xref()));
                }
              }
              disabled={entitiesDisabled}
              tooltip="Cross Reference Link">
            <i className={'fa fa-map-signs'}/>
          </ToolbarButton>

        </ToolbarLayoutInline>
      </React.Fragment>
    );
  }

  renderMain() : JSX.Element {

    const ignoreSelection = () => {};

    return (
      <div className="contiguous-text">

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

