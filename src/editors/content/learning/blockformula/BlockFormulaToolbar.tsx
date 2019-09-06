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

import { styles } from './BlockFormula.styles';
import { StyledComponentProps } from 'types/component';
import { Maybe } from 'tsmonad';
import { Editor } from 'slate';
import * as editorUtils from '../contiguoustext/utils';

export interface BlockFormulaToolbarProps
  extends AbstractContentEditorProps<contentTypes.BlockFormula> {
  selection: TextSelection;
  editor: Maybe<Editor>;
}

export interface BlockFormulaToolbarState {

}


function insertInline(editor: Maybe<Editor>, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.insertInline(e, wrapper));
}
function updateInline(editor: Maybe<Editor>, key: string, wrapper: InlineTypes) {
  editor.lift(e => editorUtils.updateInlineData(e, key, wrapper));
}

type StyledBlockFormulaToolbarProps = StyledComponentProps<BlockFormulaToolbarProps, typeof styles>;

class BlockFormulaToolbar
  extends AbstractContentEditor<contentTypes.BlockFormula,
  StyledBlockFormulaToolbarProps, BlockFormulaToolbarState> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps: StyledBlockFormulaToolbarProps, nextState) {
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
        updateInline(this.props.editor, key, updated);
      },
    };

    return React.createElement(
      getEditorByContentType((data as any).contentType), props);

  }

  renderSidebar() {
    const { editor } = this.props;

    const plainSidebar = <SidebarContent title="Formula" />;

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

    const { editor, editMode, selection } = this.props;
    const supports = el => this.props.parent.supportedElements.contains(el);
    const noTextSelected = selection && selection.isCollapsed();
    const styles = editorUtils.getActiveStyles(editor);
    const cursorInEntity = editor.caseOf({
      just: e => editorUtils.getEntityAtCursor(e).caseOf({
        just: i => true,
        nothing: () => false,
      }),
      nothing: () => false,
    });

    const pointEntitiesEnabled = editMode && !cursorInEntity && noTextSelected;

    return (
      <ToolbarGroup
        label="Formula" highlightColor={CONTENT_COLORS.BlockFormula} columns={5.4}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Bold))
            }
            disabled={!editMode}
            active={styles.has('em')}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Italic))
            }
            disabled={!editMode}
            active={styles.has('italic')}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Strikethrough))
            }
            disabled={!editMode}
            active={styles.has('line-through')}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Highlight))
            }
            disabled={!editMode}
            active={styles.has('highlight')}
            tooltip="Highlight">
            <i className={'fas fa-pencil-alt'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Superscript))
            }
            disabled={!editMode}
            active={styles.has('sup')}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => this.props.editor.lift(e => e.toggleMark(InlineStyles.Subscript))
            }
            disabled={!editMode}
            active={styles.has('sub')}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={
              () => {
                insertInline(this.props.editor, new contentTypes.Math());
              }
            }
            disabled={!supports('m:math') || !pointEntitiesEnabled}
            tooltip="MathML or Latex formula">
            {getContentIcon(insertableContentTypes.Math)}
          </ToolbarButton>
        </ToolbarLayout.Inline>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return null;
  }
}

const StyledBlockFormulaToolbar = withStyles<BlockFormulaToolbarProps>(styles)(BlockFormulaToolbar);
export default StyledBlockFormulaToolbar;
