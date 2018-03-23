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

import styles from './Entity.style';

export interface BlockFormulaProps
  extends AbstractContentEditorProps<contentTypes.BlockFormula> {
  onShowSidebar: () => void;
}

export interface BlockFormulaState {

}

@injectSheet(styles)
export class BlockFormula
    extends AbstractContentEditor
    <contentTypes.BlockFormula, BlockFormulaProps & JSSProps, BlockFormulaState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Formula">
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Formula" highlightColor={CONTENT_COLORS.BlockFormula} columns={2}>
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
      <div className="formulaEditor">
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
