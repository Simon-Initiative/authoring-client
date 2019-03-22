import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps, RenderContext }
  from 'editors/content/common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/contiguoustext/ContiguousTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import BlockQuoteToolbar from './BlockQuoteToolbar.controller';

import { styles } from './BlockQuote.styles';
import { StyledComponentProps } from 'types/component';

export interface BlockQuoteEditorProps
  extends AbstractContentEditorProps<contentTypes.BlockQuote> {
  onShowSidebar: () => void;
}

export interface BlockQuoteEditorState {

}

class BlockQuoteEditor
    extends AbstractContentEditor
    <contentTypes.BlockQuote, StyledComponentProps<BlockQuoteEditorProps, typeof styles>,
    BlockQuoteEditorState> {

  constructor(props) {
    super(props);

    this.onEditText = this.onEditText.bind(this);
    this.onFocusOverride = this.onFocusOverride.bind(this);
  }

  onEditText(text: ContiguousText, source) {
    const model = this.props.model.with({ text });
    this.props.onEdit(model, model);
  }

  renderSidebar() {
    return <BlockQuoteToolbar {...this.props} renderContext={RenderContext.Sidebar} />;
  }

  renderToolbar() {
    return <BlockQuoteToolbar {...this.props} renderContext={RenderContext.Toolbar} />;
  }

  onFocusOverride(model, parent, selection) {
    this.props.onFocus(this.props.model, this.props.parent, selection);
  }

  renderMain() {
    const { classes } = this.props;

    return (
      <div className={classNames(['quoteEditor', classes.quoteEditor])}>
        <div className={classes.quoteWrapper}>
          <ContiguousTextEditor
            {...this.props}
            onInsertParsedContent={() => {}}
            onFocus={this.onFocusOverride}
            model={this.props.model.text}
            onEdit={this.onEditText}>
          </ContiguousTextEditor>
        </div>
      </div>
    );
  }
}

const StyledBlockQuoteEditor = withStyles<BlockQuoteEditorProps>(styles)(BlockQuoteEditor);
export default StyledBlockQuoteEditor;
