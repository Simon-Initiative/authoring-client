import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { MathEditor as SourceBasedMathEditor } from 'utils/math/MathEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

export interface MathEditorProps
  extends AbstractContentEditorProps<contentTypes.Math> {
  onShowSidebar: () => void;
}

export interface MathEditorState {

}

/**
 * React Component
 */
export default class MathEditor
  extends AbstractContentEditor
  <contentTypes.Math, MathEditorProps & JSSProps, MathEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    const { model, onEdit, editMode } = this.props;

    return (
      <SidebarContent title="Math Editor">
        <SidebarGroup label="">
          <SidebarRow label="">
            <SourceBasedMathEditor
              content={model.data}
              editMode={editMode}
              onChange={(data) => {
                onEdit(model.with({ data }));
              }}
            />
          </SidebarRow>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Math Editor" columns={3} highlightColor={CONTENT_COLORS.Math}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-sliders" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain() {
    return null;
  }
}
