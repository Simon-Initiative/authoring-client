import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { TextInput } from 'editors/content/common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

export interface CiteEditorProps
  extends AbstractContentEditorProps<contentTypes.Cite> {
  onShowSidebar: () => void;
}

export interface CiteEditorState {

}

/**
 * React Component
 */
export default class CiteEditor
  extends AbstractContentEditor
  <contentTypes.Cite, CiteEditorProps & JSSProps, CiteEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Citation" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Citation" highlightColor={CONTENT_COLORS.Cite} />
    );
  }

  renderMain() {
    return null;
  }
}
