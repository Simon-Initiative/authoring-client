import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps, RenderContext }
  from 'editors/content/common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { ContiguousText } from 'data/content/learning/contiguous';
import BlockQuoteToolbar from './BlockQuoteToolbar.controller';

import styles from './BlockQuote.style';

export interface BlockQuoteProps
  extends AbstractContentEditorProps<contentTypes.BlockQuote> {
  onShowSidebar: () => void;
}

export interface BlockQuoteState {

}

@injectSheet(styles)
export class BlockQuote
    extends AbstractContentEditor
    <contentTypes.BlockQuote, BlockQuoteProps & JSSProps, BlockQuoteState> {

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
            onFocus={this.onFocusOverride}
            model={this.props.model.text}
            onEdit={this.onEditText}>
          </ContiguousTextEditor>
        </div>
      </div>
    );
  }
}
