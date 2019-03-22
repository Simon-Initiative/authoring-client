import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
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
  <contentTypes.Cite, CiteEditorProps, CiteEditorState> {

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
