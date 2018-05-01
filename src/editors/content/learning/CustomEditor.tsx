import * as React from 'react';
import { Custom } from 'data/content/assessment/custom';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
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
    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Audio} columns={4}>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {
    const { model } = this.props;

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
