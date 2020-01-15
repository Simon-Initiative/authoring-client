import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextToolbar
  from 'editors/content/learning/contiguoustext/ContiguousTextToolbar.controller';
import { styles } from 'editors/content/learning/contiguoustext/ContiguousText.styles';
import { Editor, getEventTransfer } from 'slate-react';
import { Value, Inline, Editor as EditorCore } from 'slate';
import { renderMark, renderInline, plugins, renderBlock } from './render/render';
import * as editorUtils from './utils';

export interface Props extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  viewOnly?: boolean;
  editorStyles?: any;
  hideBorder?: boolean;
  placeholder?: string;
  onUpdateEditor: (editor) => void;
  onSelectInline: (inline: Maybe<Inline>) => void;
  onInsertParsedContent: (resourcePath: string, o) => void;
  orderedIds: Immutable.Map<string, number>;
}

export interface State {
  value: Value;
}

type StyledProps = StyledComponentProps<Props, typeof styles>;

/**
 * The content editor for contiguous text.
 */
class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText, StyledProps, State> {

  editor: Editor;

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.model.slateValue,
    };
  }

  onChange = ({ value }) => {
    const v: Value = value;

    const edited = v.document !== this.state.value.document;
    const updateSelection = v.selection !== this.state.value.selection;

    // Always update local state with the new slate value
    this.setState({ value }, () => {

      if (edited) {
        // But only notify our parent of an edit when something
        // has actually changed
        const updated = this.props.model.with({ slateValue: value });
        this.props.onEdit(updated, updated);

        // We must always broadcast the latest version of the editor
        this.props.onUpdateEditor(this.editor);
        this.editor.focus();

        // Do not broadcast changes if the editor is unfocused (de-selected)
      } else if (updateSelection && !v.selection.isFocused) {
        return;

      } else if (updateSelection) {

        // Broadcast the fact that the editor updated
        this.props.onUpdateEditor(this.editor);

        // Based on the new selection, update whether or not
        // the cursor is 'in' an inline or not
        this.props.onSelectInline(
          editorUtils.getInlineAtCursor(this.editor as any));
      }

    });

  }

  componentWillReceiveProps(nextProps: StyledProps) {

    // We ignore the model being pushed down to us from parent updates,
    // because we know we already have the most up to date Slate value in
    // the local state.  Except for when the "forcedUpdateCount" changes,
    // as that is a signal to us that something external has changed the
    // content and we must pull it down into state to rerender.
    if (this.props.model.forcedUpdateCount !== nextProps.model.forcedUpdateCount) {
      this.setState({ value: nextProps.model.slateValue });
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return this.props.model.forcedUpdateCount !== nextProps.model.forcedUpdateCount
      || this.props.editMode !== nextProps.editMode
      || this.props.selectedEntity !== nextProps.selectedEntity
      || this.props.orderedIds !== nextProps.orderedIds
      || this.state.value !== nextState.value;
  }

  renderSidebar() {
    return <ContiguousTextToolbar {...this.props} renderContext={RenderContext.Sidebar} />;
  }

  renderToolbar() {
    return <ContiguousTextToolbar {...this.props} renderContext={RenderContext.Toolbar} />;
  }

  handleOnFocus(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  slateOnFocus = (e) => {
    this.props.onUpdateEditor(this.editor);
    this.props.onFocus(this.props.model, this.props.parent, Maybe.nothing());
  }

  onPaste = (event, editor: EditorCore, next) => {

    const et = getEventTransfer(event);

    if (et.type === 'fragment') {

      // We have to pre-process slate fragments before pasting them to
      // correct for a few things
      const updated = editorUtils.adjustForPasting((et as any).fragment);
      editor.insertFragment(updated);
      event.preventDefault();

    } else {
      next();
    }

    return true;
  }

  renderMain(): JSX.Element {
    const { className, classes, editMode, viewOnly, editorStyles, placeholder,
      hideBorder = false, context, onSelectInline } = this.props;

    const showBorder = !viewOnly && !hideBorder;

    const onInlineClick = (node: Inline) => {
      onSelectInline(Maybe.just(node));
    };

    const extras = {
      onInlineClick,
      context,
      parentProps: this.props,
      parent: this,
    };

    return (
      <div
        style={editorStyles}
        className={classNames([
          'contiguousTextEditor', classes.contiguousText,
          showBorder && classes.showBorder,
          !editMode && classes.disabled,
          viewOnly && classes.viewOnly, className])}>

        <Editor
          ref={editor => this.editor = editor}
          className={classes.contiguousTextSlateEditor}
          placeholder={placeholder}
          onPaste={this.onPaste}
          onFocus={this.slateOnFocus}
          plugins={plugins}
          value={this.state.value}
          onChange={this.onChange}
          readOnly={!editMode}
          renderBlock={renderBlock}
          renderMark={renderMark}
          renderInline={renderInline.bind(this, extras)}
        />
      </div>
    );
  }
}

const StyledContiguousTextEditor = withStyles<Props>(styles)
  (ContiguousTextEditor);
export default StyledContiguousTextEditor;
