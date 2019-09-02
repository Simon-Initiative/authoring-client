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
import { Maybe } from 'tsmonad';
import { TextSelection, Trigger } from 'types/active';
import { getEditorByContentType } from 'editors/content/container/registry';
import { ContiguousTextMode } from 'data/content/learning/contiguous';
import { styles } from 'editors/content/learning/contiguoustext/ContiguousText.styles';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { renderMark, renderInline, plugins } from './utils';

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

    this.handleOnFocus = this.handleOnFocus.bind(this);

    this.state = {
      value: this.props.model.value,
    };

  }


  onChange = ({ value }) => {

    const v: Value = value;

    if (v.document !== this.state.value.document) {
      const updated = this.props.model.with({ value });
      this.props.onEdit(updated);
    }
    if (v.selection !== this.state.value.selection) {
      const textSelection = new TextSelection(v.selection);
      this.props.onTextSelectionChange(textSelection);
    }

    this.setState({ value });
  }

  shouldComponentUpdate(nextProps: StyledContiguousTextEditorProps, nextState) {
    return this.state.value !== nextState.value
      || nextProps.selectedEntity !== this.props.selectedEntity
      || nextProps.orderedIds !== this.props.orderedIds;
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
    return <ContiguousTextToolbar {...this.props} renderContext={RenderContext.Sidebar} />;
  }

  renderToolbar() {
    return <ContiguousTextToolbar {...this.props} renderContext={RenderContext.Toolbar} />;
  }

  handleOnFocus(e) {

    this.props.onUpdateEditor(this.editor);

    const selection = this.props.model.value.selection;
    const textSelection = new TextSelection(selection);
    this.props.onTextSelectionChange && this.props.onTextSelectionChange(textSelection);

    textSelection.triggeredBy = Trigger.KEYPRESS;

    this.props.onFocus(this.props.model, this.props.parent, Maybe.just(textSelection));
  }

  renderMain(): JSX.Element {
    const { className, classes, model, parent, editMode, viewOnly,
      hideBorder = false, editorStyles, context } = this.props;

    const showBorder = !viewOnly && !hideBorder;

    const onDecoratorClick = () => {

    };

    const extras = {
      onDecoratorClick,
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
          onFocus={this.handleOnFocus}
          plugins={plugins}
          value={this.state.value}
          onChange={this.onChange}
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
