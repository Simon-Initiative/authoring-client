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

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  viewOnly?: boolean;
  editorStyles?: any;
  hideBorder?: boolean;
  onUpdateEditor: (editor) => void;
  onSelectInline: (inline: Maybe<Inline>) => void;
  onInsertParsedContent: (resourcePath: string, o) => void;
  orderedIds: Immutable.Map<string, number>;
}

export interface ContiguousTextEditorState {
  value: Value;
}

type StyledContiguousTextEditorProps =
  StyledComponentProps<ContiguousTextEditorProps, typeof styles>;


/**
 * The content editor for contiguous text.
 */
class ContiguousTextEditor
  extends AbstractContentEditor<contentTypes.ContiguousText,
  StyledContiguousTextEditorProps, ContiguousTextEditorState> {

  editor: Editor;

  constructor(props) {
    super(props);

    this.slateOnFocus = this.slateOnFocus.bind(this);
    this.onPaste = this.onPaste.bind(this);

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

      } else if (updateSelection) {

        // Broadcast the fact that the editor updated
        this.props.onUpdateEditor(this.editor);

        // Based on the new selection, update whether or not
        // the cursor is 'in' an inline or not
        this.props.onSelectInline(
          editorUtils.getEntityAtCursor(this.editor as any));
      }

    });

  }

  componentWillReceiveProps(nextProps: StyledContiguousTextEditorProps) {

    // We ignore the model being pushed down to us from parent updates,
    // because we know we already have the most up to date Slate value in
    // the local state.  Except for when the "forcedUpdateCount" changes,
    // as that is a signal to us that something external has changed the
    // content and we must pull it down into state to rerender.
    if (this.props.model.forcedUpdateCount !== nextProps.model.forcedUpdateCount) {
      this.setState({ value: nextProps.model.slateValue });
    }
  }

  shouldComponentUpdate(
    nextProps: ContiguousTextEditorProps, nextState: ContiguousTextEditorState) {
    return this.props.model.forcedUpdateCount !== nextProps.model.forcedUpdateCount
      || this.props.editMode !== nextProps.editMode
      || this.state.value !== nextState.value
      || nextProps.selectedEntity !== this.props.selectedEntity
      || nextProps.orderedIds !== this.props.orderedIds
      || this.props.hover !== nextProps.hover;
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

  slateOnFocus(e) {
    this.props.onFocus(this.props.model, this.props.parent, Maybe.nothing());
    this.props.onUpdateEditor(this.editor);
  }

  onPaste(event, editor: EditorCore, next): boolean {

    const et = getEventTransfer(event);

    if (et.type === 'fragment') {

      // Marshalling of clipboard data of a slate fragment results
      // in the wrappers that are present in the inline data map being
      // turned into plain javascript objects. To fix this, we manually apply
      // the paste and (depending on the wrapper type) either strip out
      // or reapply the wrapper.
      const updated = editorUtils.reapplyWrappers((et as any).fragment);
      editor.insertFragment(updated);
      event.preventDefault();

    } else {
      next();
    }

    return true;
  }

  renderMain(): JSX.Element {
    const { className, classes, editMode, viewOnly,
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
        className={classNames([
          'contiguousTextEditor', classes.contiguousText,
          showBorder && classes.showBorder,
          !editMode && classes.disabled,
          viewOnly && classes.viewOnly, className])}>

        <Editor
          ref={editor => this.editor = editor}
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

const StyledContiguousTextEditor = withStyles<ContiguousTextEditorProps>(styles)
  (ContiguousTextEditor);
export default StyledContiguousTextEditor;
