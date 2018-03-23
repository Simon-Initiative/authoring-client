import * as React from 'react';
import { injectSheet, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { Label } from '../common/Sidebar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';
import { ContentElement } from 'data/content/common/interfaces';

import styles from './Entity.style';

export interface BlockCodeProps
  extends AbstractContentEditorProps<contentTypes.BlockCode> {
  onShowSidebar: () => void;
}

export interface BlockCodeState {

}

@injectSheet(styles)
export class BlockCode
    extends AbstractContentEditor
    <contentTypes.BlockCode, BlockCodeProps & JSSProps, BlockCodeState> {

  constructor(props) {
    super(props);

    this.onEditText = this.onEditText.bind(this);
  }

  onEditText(content: ContentElement, source) {
    console.log('content1', content);
    const updatedText = this.props.model.text.with({ content });
    const model = this.props.model.with({ text: updatedText });
    this.props.onEdit(model, source);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Code">
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Code" highlightColor={CONTENT_COLORS.BlockCode} columns={2}>
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
      <div className="codeEditor">
        <Label>Code</Label>
        <ContiguousTextEditor
          {...this.props}
          model={this.props.model.text.with({ mode: ContiguousTextMode.SimpleText })}
          editorStyles={{ fontSize: 20 }}
          onEdit={() => {}}
        />
      </div>
    );
  }
}
