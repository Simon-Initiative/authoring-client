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

export interface FormulaEditorProps
  extends AbstractContentEditorProps<contentTypes.Formula> {
  onShowSidebar: () => void;
}

export interface FormulaEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export class FormulaEditor
    extends AbstractContentEditor
    <contentTypes.Formula, FormulaEditorProps & JSSProps, FormulaEditorState> {

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
      <ToolbarGroup label="Formula" highlightColor={CONTENT_COLORS.Formula} columns={2}>
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
          model={(this.props.model.text.content as any).first()}
          editorStyles={{ fontSize: 20 }}
          viewOnly
          onEdit={() => {}} />
      </div>
    );
  }
}
