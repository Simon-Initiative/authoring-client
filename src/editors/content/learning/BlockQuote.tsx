import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';

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
  }

  onEditText(text: ContiguousText, source) {
    const model = this.props.model.with({ text });
    this.props.onEdit(model, source);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Quote"/>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Quote" highlightColor={CONTENT_COLORS.BlockQuote} columns={2}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders"/></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain() {
    const { classes } = this.props;

    return (
      <div className={classNames(['quoteEditor', classes.quoteEditor])}>
        <div className={classes.quoteWrapper}>
          <ContiguousTextEditor
            {...this.props}
            model={this.props.model.text}
            onEdit={this.onEditText}>
          </ContiguousTextEditor>
        </div>
      </div>
    );
  }
}
