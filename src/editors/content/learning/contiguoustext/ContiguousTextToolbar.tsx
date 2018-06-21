import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarGroup, ToolbarLayout, determineBaseUrl }
  from 'components/toolbar/ContextAwareToolbar';
import { InlineStyles } from 'data/content/learning/contiguous';
import { EntityTypes } from 'data/content/learning/common';
import { getEditorByContentType } from 'editors/content/container/registry';
import { TextSelection } from 'types/active';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { selectImage } from 'editors/content/learning/ImageEditor';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models/course';
import { ContentElements, EXTRA_ELEMENTS } from 'data/content/common/elements';
import { styles } from './ContiguousText.styles';

export interface ContiguousTextToolbarProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  courseModel: CourseModel;
  resource: Resource;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
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

  shouldComponentUpdate(nextProps: ContiguousTextToolbarProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || nextProps.selection !== this.props.selection;
  }

  renderActiveEntity(entity) {

    const { key, data } = entity;

    const props = {
      ...this.props,
      renderContext: RenderContext.Sidebar,
      onFocus: (c, p) => true,
      model: data,
      onEdit: (updated) => {
        const updatedModel = this.props.model.updateEntity(key, updated);
        this.props.onEdit(updatedModel, updated);
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
    return <SidebarContent title="Text Block" />;
  }

  renderToolbar() {

    const { model, onEdit, editMode, selection } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);

    const noTextSelected = selection && selection.isCollapsed();

    const bareTextSelected = selection && selection.isCollapsed()
      ? false
      : !model.selectionOverlapsEntity(selection);

    // We enable the bdo button only when there is a selection that
    // doesn't overlap an entity, and that selection selects only
    // bare text or just another bdo
    const intersectingStyles = model.getOverlappingInlineStyles(selection);
    const onlyBdoOrEmpty = intersectingStyles.size === 0
      || (intersectingStyles.size === 1 && intersectingStyles.contains('BDO'));

    const bdoDisabled = !selection || selection.isCollapsed()
      || model.selectionOverlapsEntity(selection)
      || !onlyBdoOrEmpty;

    const cursorInEntity = selection && selection.isCollapsed()
      ? model.getEntityAtCursor(selection).caseOf({ just: n => true, nothing: () => false })
      : false;

    const rangeEntitiesEnabled = editMode && bareTextSelected;
    const pointEntitiesEnabled = editMode && !cursorInEntity && noTextSelected;

    return (
      <ToolbarGroup
        label="Text Block" highlightColor={CONTENT_COLORS.ContiguousText} columns={12.4}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Bold, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Italic, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Strikethrough, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Highlight, selection))
            }
            disabled={!supports('em') || noTextSelected || !editMode}
            tooltip="Highlight">
            <i className={'fa fa-pencil'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Superscript, selection))
            }
            disabled={!supports('sup') || noTextSelected || !editMode}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Subscript, selection))
            }
            disabled={!supports('sub') || noTextSelected || !editMode}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => onEdit(model.toggleStyle(InlineStyles.Var, selection))
            }
            disabled={!supports('code') || noTextSelected || !editMode}
            tooltip="Code">
            <i className={'fa fa-code'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              onEdit(model.toggleStyle(InlineStyles.Term, selection));
            }}
            disabled={!supports('term') || noTextSelected || !editMode}
            tooltip="Term">
            <i className={'fa fa-book'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              onEdit(model.toggleStyle(InlineStyles.Foreign, selection));
            }}
            disabled={!supports('foreign') || noTextSelected || !editMode}
            tooltip="Foreign">
            <i className={'fa fa-globe'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              onEdit(model.toggleStyle(InlineStyles.BidirectionTextOverride, selection));
            }}
            disabled={!supports('bdo') || bdoDisabled || !editMode}
            tooltip="Reverse Text Direction">
            <i className={'fa fa-angle-left'} />
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
            <i className={'fa fa-quote-right'} />
          </ToolbarButton>
          {/* <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.cite, true, new contentTypes.Cite(), selection));
              }
            }
            disabled={!supports('cite') || !rangeEntitiesEnabled}
            tooltip="Citation">
            <i className={'fa fa-asterisk'} />
          </ToolbarButton> */}
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.link, true, new contentTypes.Link(), selection));
              }
            }
            disabled={!supports('link') || !rangeEntitiesEnabled}
            tooltip="Hyperlink">
            <i className={'fa fa-link'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                const material = contentTypes.Material.fromText('Sample definition', '');
                const m = new contentTypes.Meaning().with({ material });
                const extra = new contentTypes.Extra().with({
                  meaning: Immutable.OrderedMap<string, contentTypes.Meaning>().set(m.guid, m),
                });

                onEdit(model.addEntity(
                  EntityTypes.extra, true, extra, selection));
              }
            }
            disabled={!supports('extra') || !rangeEntitiesEnabled}
            tooltip="Rollover Definition">
            <i className={'fa fa-book'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                const extra = new contentTypes.Extra().with({
                  content: ContentElements.fromText('Sample content', '', EXTRA_ELEMENTS),
                });

                onEdit(model.addEntity(
                  EntityTypes.extra, true, extra, selection));
              }
            }
            disabled={!supports('extra') || !rangeEntitiesEnabled}
            tooltip="Rollover Content">
            <i className={'fa fa-address-book-o'} />
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
            <i className={'fa fa-check'} />
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
            <i className={'fa fa-map-signs'} />
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
            <i className={'fa fa-etsy'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                onEdit(model.addEntity(
                  EntityTypes.sym, true, new contentTypes.Sym(), selection));
              }
            }
            disabled={!supports('sym') || !pointEntitiesEnabled}
            tooltip="HTML Entity or Symbol">
            <i className={'fa fa-circle'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              selectImage(null, determineBaseUrl(this.props.resource), this.props.courseModel,
                          this.props.onDisplayModal, this.props.onDismissModal)
                .then((image) => {
                  if (image !== null) {
                    onEdit(model.addEntity(EntityTypes.image, true, image, selection));
                  }
                });
            }}
            tooltip="Insert Image"
            disabled={!supports('image') || !pointEntitiesEnabled}>
            <i className={'fa fa-image'} />
          </ToolbarButton>

        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return null;
  }

}

