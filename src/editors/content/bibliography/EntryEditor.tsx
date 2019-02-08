import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { CONTENT_COLORS } from
  'editors/content/utils/content';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { AbstractContentEditor, AbstractContentEditorProps }
  from 'editors/content/common/AbstractContentEditor';

import { styles } from './EntryEditor.styles';

export interface EntryEditorProps
  extends AbstractContentEditorProps<contentTypes.Entry> {
  onShowSidebar: () => void;
}

export interface EntryEditorState {

}

@injectSheet(styles)
export default class EntryEditor
  extends AbstractContentEditor
  <contentTypes.Entry, EntryEditorProps & JSSProps, EntryEditorState> {

  constructor(props) {
    super(props);
  }


  renderSidebar() {
    return (
      <SidebarContent title="Entry" />
    );
  }


  renderToolbar() {
    return (
      <ToolbarGroup label="Entry" highlightColor={CONTENT_COLORS.Entry} />
    );
  }

  renderMain() {
    const { classes } = this.props;

    return (
      <div className={classNames([classes.entry])}>
        Entry
      </div>
    );
  }
}
