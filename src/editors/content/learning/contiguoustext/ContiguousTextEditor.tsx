import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextToolbar
  from 'editors/content/learning/contiguoustext/ContiguousTextToolbar.controller';
import { styles } from 'editors/content/learning/contiguoustext/ContiguousText.styles';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { renderMark, renderInline, plugins, renderBlock } from './utils';

export interface ContiguousTextEditorProps
  extends AbstractContentEditorProps<contentTypes.ContiguousText> {
  viewOnly?: boolean;
  editorStyles?: any;
  hideBorder?: boolean;
  onUpdateEditor: (editor) => void;
  onTextSelectionChange?: (selection: any) => void;
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

  selectionState: any;
  editor;

  constructor(props) {
    super(props);

    this.slateOnFocus = this.slateOnFocus.bind(this);

    this.state = {
      value: this.props.model.slateValue,
    };

  }


  onChange = ({ value }) => {

    const v: Value = value;

    const edited = v.document !== this.state.value.document;
    const updateSelection = v.selection !== this.state.value.selection;

    this.setState({ value }, () => {

      if (edited) {
        const updated = this.props.model.with({ slateValue: value });
        this.props.onEdit(updated, updated);
        this.props.onUpdateEditor(this.editor);

      } else if (updateSelection) {
        this.props.onUpdateEditor(this.editor);
      }
    });
  }

  componentWillReceiveProps(nextProps: StyledContiguousTextEditorProps) {
    if (this.props.model.forcedUpdateCount !== nextProps.model.forcedUpdateCount) {
      this.setState({ value: nextProps.model.slateValue });
    }
  }

  shouldComponentUpdate(nextProps: StyledContiguousTextEditorProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.state.value !== nextState.value
      || nextProps.selectedEntity !== this.props.selectedEntity
      || nextProps.orderedIds !== this.props.orderedIds;
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
    this.props.onUpdateEditor(this.editor);
  }

  renderMain(): JSX.Element {
    const { className, classes, editMode, viewOnly,
      hideBorder = false, context } = this.props;

    const showBorder = !viewOnly && !hideBorder;

    const onInlineClick = (node) => {

    };

    const extras = {
      onInlineClick,
      context,
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
          onFocus={this.slateOnFocus}
          plugins={plugins}
          value={this.state.value}
          onChange={this.onChange}
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
