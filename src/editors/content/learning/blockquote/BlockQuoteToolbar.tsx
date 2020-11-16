import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { InlineStyles, InlineTypes } from 'data/content/learning/contiguous';
import { getEditorByContentType } from 'editors/content/container/registry';
import { TextSelection } from 'types/active';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { LegacyTypes } from 'data/types';
import { PLACEHOLDER_ITEM_ID } from 'data/content/org/common';
import { ResourceState } from 'data/content/resource';
import { styles } from './BlockQuote.styles';
import { StyledComponentProps } from 'types/component';
import { Maybe } from 'tsmonad';
import { Editor, Inline } from 'slate';
import * as editorUtils from '../contiguoustext/utils';

export interface BlockQuoteToolbarProps
  extends AbstractContentEditorProps<contentTypes.BlockQuote> {
  selection: TextSelection;
  editor: Maybe<Editor>;
  activeInline: Maybe<Inline>;
}

export interface BlockQuoteToolbarState {

}

type StyledBlockQuoteToolbarProps = StyledComponentProps<BlockQuoteToolbarProps, typeof styles>;


function applyInline(editor: Maybe<Editor>, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.applyInline(e, wrapper));
}
function insertInline(editor: Maybe<Editor>, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.insertInline(e, wrapper));
}
function updateInline(editor: Maybe<Editor>, key: string, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.updateInlineData(e, key, wrapper));
}

class BlockQuoteToolbar
  extends AbstractContentEditor<contentTypes.BlockQuote,
  StyledBlockQuoteToolbarProps, BlockQuoteToolbarState> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps: StyledBlockQuoteToolbarProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || nextProps.selection !== this.props.selection;
  }

  renderActiveEntity(entity) {

    const { key, data } = entity;

    const props = {
      ...this.props,
      renderContext: RenderContext.Sidebar,
      onFocus: (c, p) => true,
      model: data.get('value'),
      onEdit: (updated) => {
        updateInline(this.props.editor, key, updated);
      },
    };

    return React.createElement(
      getEditorByContentType(data.get('value').contentType), props);

  }

  renderSidebar() {
    const { editor, activeInline } = this.props;

    const plainSidebar = <SidebarContent title="Quote" />;

    const inline = activeInline.caseOf({
      just: i => i,
      nothing: () => null,
    });

    if (inline !== null) {
      return this.renderActiveEntity(inline);
    }

    return editor.caseOf({
      just: (e) => {
        return editorUtils.getInlineAtCursor(e).caseOf({
          just: entity => this.renderActiveEntity(entity),
          nothing: () => plainSidebar,
        });
      },
      nothing: () => plainSidebar,
    });
  }

  renderToolbar() {

    const { editMode, editor } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);
    const cursorInEntity = editorUtils.cursorInEntity(editor);
    const rangeEntitiesEnabled = editMode && editorUtils.bareTextSelected(editor);
    const pointEntitiesEnabled = editMode && !cursorInEntity && editorUtils.noTextSelected(editor);
    const styles = editorUtils.getActiveStyles(editor);

    return (
      <ToolbarGroup
        label="Quote" highlightColor={CONTENT_COLORS.BlockQuote} columns={7.7}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Bold))
            }
            disabled={!editMode}
            selected={styles.has('em')}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Italic))
            }
            disabled={!editMode}
            selected={styles.has('italic')}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Strikethrough))
            }
            disabled={!editMode}
            selected={styles.has('line-through')}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Highlight))
            }
            disabled={!editMode}
            selected={styles.has('highlight')}
            tooltip="Highlight">
            <i className={'fas fa-pencil-alt'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Superscript))
            }
            disabled={!editMode}
            selected={styles.has('sup')}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Subscript))
            }
            disabled={!editMode}
            selected={styles.has('sub')}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Var))
            }
            disabled={!editMode}
            selected={styles.has('var')}
            tooltip="Code">
            {getContentIcon(insertableContentTypes.BlockCode)}
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                insertInline(this.props.editor, new contentTypes.Math());
              }
            }
            disabled={!supports('m:math') || !pointEntitiesEnabled}
            tooltip="MathML formula">
            {getContentIcon(insertableContentTypes.Math)}
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                this.props.editor.lift(e => e.insertText(' \\( InlineFormula=\\pi r^2 \\) '));
              }
            }
            disabled={!supports('m:math') || !pointEntitiesEnabled}
            tooltip="LaTex formula">
            {getContentIcon(insertableContentTypes.LaTex)}
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                applyInline(this.props.editor, new contentTypes.Link());
              }
            }
            disabled={!supports('link') || !rangeEntitiesEnabled}
            tooltip="Hyperlink">
            <i className={'fa fa-link'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {

                const thisId = this.props.context.courseModel.resourcesById.get(
                  this.props.context.documentId).id;

                const pages = this.props.context.courseModel.resources
                  .toArray()
                  .filter(r => r.type === LegacyTypes.workbook_page &&
                    r.id !== thisId &&
                    r.id !== PLACEHOLDER_ITEM_ID &&
                    r.resourceState !== ResourceState.DELETED);

                const xrefDefault = pages[0] ? pages[0].id : thisId;

                if (pages.length > 0) {
                  applyInline(this.props.editor,
                    new contentTypes.Xref({ page: xrefDefault, idref: xrefDefault }));
                }
              }
            }
            disabled={!supports('xref') || !rangeEntitiesEnabled}
            tooltip="Cross Reference Link">
            <i className={'fa fa-map-signs'} />
          </ToolbarButton>
        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return null;
  }
}

const StyledBlockQuoteToolbar = withStyles<BlockQuoteToolbarProps>(styles)(BlockQuoteToolbar);
export default StyledBlockQuoteToolbar;
