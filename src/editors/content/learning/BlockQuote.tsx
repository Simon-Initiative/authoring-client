import * as React from 'react';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { Label } from '../common/Sidebar';
import { SidebarRow, SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { MediaMetadata, MediaWidthHeight } from 'editors/content/learning/MediaItems';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import styles from './Entity.style';

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
  }

  renderSidebar() {
    return (
      <SidebarContent title="Quote">
      </SidebarContent>
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
    const { } = this.props;

    return (
      <div className="quoteEditor">
    {/* Do we need the entry property? What is this? */}
        <Label>Entry</Label>
        <ContiguousTextEditor
          {...this.props}
          model={this.props.model.text}
          editorStyles={{ fontSize: 20 }}
          viewOnly
          onEdit={() => {}} />
      </div>
    );
  }
}
