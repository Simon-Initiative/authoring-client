import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps, RenderContext }
  from 'editors/content/common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/contiguoustext/ContiguousTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import BlockCodeToolbar from './BlockCodeToolbar.controller';
import { styles } from './BlockCode.styles';
import { StyledComponentProps } from 'types/component';
import { connectTextEditor } from 'editors/content/container/connectEditor';
import { Inline } from 'slate';

export interface BlockCodeEditorProps
  extends AbstractContentEditorProps<contentTypes.BlockCode> {
  onShowSidebar: () => void;
  onUpdateEditor: (editor) => void;
  onSelectInline: (wrapper: Inline) => void;
}

export interface BlockCodeEditorState {

}

class BlockCodeEditor
  extends AbstractContentEditor
  <contentTypes.BlockCode, StyledComponentProps<BlockCodeEditorProps, typeof styles>,
  BlockCodeEditorState> {

  constructor(props) {
    super(props);

    this.onEditText = this.onEditText.bind(this);
    this.onFocusOverride = this.onFocusOverride.bind(this);
  }

  onEditText(text: ContiguousText, source) {
    const model = this.props.model.with({ text });
    this.props.onEdit(model, model);
  }

  onFocusOverride(model, parent, selection) {
    this.props.onFocus(this.props.model, this.props.parent, selection);
  }

  renderSidebar() {
    return <BlockCodeToolbar {...this.props} renderContext={RenderContext.Sidebar} />;
  }

  renderToolbar() {
    return <BlockCodeToolbar {...this.props} renderContext={RenderContext.Toolbar} />;
  }

  renderMain() {
    const { classes } = this.props;

    return (
      <div className={classNames(['codeEditor', classes.codeEditor])}>
        <ContiguousTextEditor
          {...this.props}
          onUpdateEditor={this.props.onUpdateEditor}
          onInsertParsedContent={() => { }}
          orderedIds={null}
          onFocus={this.onFocusOverride}
          model={this.props.model.text}
          onEdit={this.onEditText}
        />
      </div>
    );
  }
}

const StyledBlockCodeEditor = withStyles<BlockCodeEditorProps>(styles)(BlockCodeEditor);
export default connectTextEditor(StyledBlockCodeEditor);
