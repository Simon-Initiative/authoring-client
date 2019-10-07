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
import { CONTENT_COLORS } from 'editors/content/utils/content';

import { styles } from './BlockCode.styles';
import { StyledComponentProps } from 'types/component';

import { Maybe } from 'tsmonad';
import { Editor, Inline } from 'slate';
import * as editorUtils from '../contiguoustext/utils';

export interface BlockCodeToolbarProps
  extends AbstractContentEditorProps<contentTypes.BlockCode> {
  selection: TextSelection;
  editor: Maybe<Editor>;
  activeInline: Maybe<Inline>;
}

export interface BlockCodeToolbarState {

}

type StyledBlockCodeToolbarProps = StyledComponentProps<BlockCodeToolbarProps, typeof styles>;


function applyInline(editor: Maybe<Editor>, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.applyInline(e, wrapper));
}
function insertInline(editor: Maybe<Editor>, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.insertInline(e, wrapper));
}
function updateInline(editor: Maybe<Editor>, key: string, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.updateInlineData(e, key, wrapper));
}

class BlockCodeToolbar
  extends AbstractContentEditor<contentTypes.BlockCode,
  StyledBlockCodeToolbarProps, BlockCodeToolbarState> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps: StyledBlockCodeToolbarProps, nextState) {
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

    const plainSidebar = <SidebarContent title="Code" />;

    const inline = activeInline.caseOf({
      just: i => i,
      nothing: () => null,
    });

    if (inline !== null) {
      return this.renderActiveEntity(inline);
    }

    return editor.caseOf({
      just: (e) => {
        return editorUtils.getEntityAtCursor(e).caseOf({
          just: entity => this.renderActiveEntity(entity),
          nothing: () => plainSidebar,
        });
      },
      nothing: () => plainSidebar,
    });
  }

  renderToolbar() {

    const { editMode, selection, editor } = this.props;
    const noTextSelected = selection && selection.isCollapsed();
    const styles = editorUtils.getActiveStyles(editor);

    return (
      <ToolbarGroup
        label="Code" highlightColor={CONTENT_COLORS.BlockCode} columns={5}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Bold))
            }
            disabled={noTextSelected || !editMode}
            active={styles.has('em')}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Italic))
            }
            disabled={noTextSelected || !editMode}
            active={styles.has('italic')}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Strikethrough))
            }
            disabled={noTextSelected || !editMode}
            active={styles.has('line-through')}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Highlight))
            }
            disabled={noTextSelected || !editMode}
            active={styles.has('highlight')}
            tooltip="Highlight">
            <i className={'fas fa-pencil-alt'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Superscript))
            }
            disabled={noTextSelected || !editMode}
            active={styles.has('sup')}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Subscript))
            }
            disabled={noTextSelected || !editMode}
            active={styles.has('sub')}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return null;
  }
}

const StyledBlockCodeToolbar = withStyles<BlockCodeToolbarProps>(styles)(BlockCodeToolbar);
export default StyledBlockCodeToolbar;
