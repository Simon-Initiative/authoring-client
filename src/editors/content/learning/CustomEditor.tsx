import * as React from 'react';
import * as Immutable from 'immutable';
import { Custom } from 'data/content/assessment/custom';
import { Button } from 'editors/content/common/Button';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

export interface CustomEditorProps extends AbstractContentEditorProps<Custom> {
  onShowSidebar: () => void;
}

export interface CustomEditorState {

}

export default class CustomEditor
  extends AbstractContentEditor<Custom, CustomEditorProps, CustomEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="" />
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Audio} columns={4}>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {
    const { model, onEdit } = this.props;

    return (
      <div className="customEditor">
        {model.src.substr(11) === 'DynaDrop.js'
          ? '[Custom Element]'
          : '[DynaDrop Drag & Drop Element]'
        }
      </div>
    );
  }
}
