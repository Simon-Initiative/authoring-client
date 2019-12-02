import * as React from 'react';
import { withStyles } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarButton } from 'components/toolbar/ToolbarButton';
import {
  ToolbarGroup, ToolbarLayout,
} from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models/course';
import { styles } from './ContiguousText.styles';
import { Maybe } from 'tsmonad';
import { StyledComponentProps } from 'types/component';
import { Editor, Value } from 'slate';
import * as editorUtils from './utils';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';

export interface ContiguousTextToolbarProps
  extends AbstractContentEditorProps<Value> {
  courseModel: CourseModel;
  resource: Resource;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
  editor: Maybe<Editor>;
}

export interface ContiguousTextToolbarState {

}

type StyledContiguousTextToolbarProps =
  StyledComponentProps<ContiguousTextToolbarProps, typeof styles>;

/**
 * The content editor for general text.
 */
class ContiguousTextToolbar
  extends AbstractContentEditor<Value,
  StyledContiguousTextToolbarProps, ContiguousTextToolbarState> {

  constructor(props) {
    super(props);

  }

  shouldComponentUpdate(nextProps: StyledContiguousTextToolbarProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || nextProps.editor !== this.props.editor;
  }

  renderSidebar() {
    return (
      <SidebarContent title="Rich Text" />
    );
  }

  renderToolbar() {
    const { editMode, editor } = this.props;
    const styles = editorUtils.getActiveStyles(editor);

    return (
      <ToolbarGroup
        label="Rich Text" highlightColor={CONTENT_COLORS.RichText} columns={6}>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('bold').focus())
            }
            disabled={!editMode}
            selected={styles.has('bold')}
            tooltip="Bold">
            <i className={'fa fa-bold'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('italic').focus())
            }
            disabled={!editMode}
            selected={styles.has('italic')}
            tooltip="Italic">
            <i className={'fa fa-italic'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('underline').focus())
            }
            disabled={!editMode}
            selected={styles.has('underline')}
            tooltip="Underline">
            <i className={'fa fa-underline'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('strikethrough').focus())
            }
            disabled={!editMode}
            selected={styles.has('strikethrough')}
            tooltip="Strikethrough">
            <i className={'fa fa-strikethrough'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('subscript').focus())
            }
            disabled={!editMode}
            selected={styles.has('subscript')}
            tooltip="Subscript">
            <i className={'fa fa-subscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('superscript').focus())
            }
            disabled={!editMode}
            selected={styles.has('superscript')}
            tooltip="Superscript">
            <i className={'fa fa-superscript'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('highlight').focus())
            }
            disabled={!editMode}
            selected={styles.has('highlight')}
            tooltip="Highlight">
            <i className={'fa fa-pencil-alt'} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              this.props.editor.lift(e => e.toggleMark('code').focus())
            }
            disabled={!editMode}
            selected={styles.has('code')}
            tooltip="Code">
            {getContentIcon(insertableContentTypes.BlockCode)}
          </ToolbarButton>
        </ToolbarLayout.Inline>
      </ToolbarGroup >
    );
  }

  renderMain(): JSX.Element {
    return null;
  }

}

const StyledContiguousTextToolbar = withStyles<ContiguousTextToolbarProps>(styles)
  (ContiguousTextToolbar);
export default StyledContiguousTextToolbar;
