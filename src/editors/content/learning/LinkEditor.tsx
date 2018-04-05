import * as React from 'react';
import { injectSheet, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Select, TextInput } from '../common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import styles from './Entity.style';

export interface LinkEditorProps extends AbstractContentEditorProps<contentTypes.Link> {
  onShowSidebar: () => void;
}

export interface LinkEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export default class LinkEditor
    extends AbstractContentEditor<contentTypes.Link, LinkEditorProps & JSSProps, LinkEditorState> {

  constructor(props) {
    super(props);
  }

  renderMain() {
    return null;
  }

  renderSidebar() {
    const { editMode, model, onEdit } = this.props;

    return (
      <SidebarContent title="External Link">

        <SidebarGroup label="URL">
          <TextInput
            editMode={editMode}
            width="100%"
            label=""
            value={model.href}
            type="string"
            onEdit={href => onEdit(model.with({ href }))}
            />
        </SidebarGroup>

        <SidebarGroup label="Target">
          <Select
            editMode={editMode}
            value={model.target}
            onChange={v =>
              onEdit(model.with({ target: v === 'self' ? LinkTarget.Self : LinkTarget.New }))}>
            <option value={LinkTarget.Self}>Open in this window</option>
            <option value={LinkTarget.New}>Open in new window</option>
          </Select>
        </SidebarGroup>

      </SidebarContent>
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup
        label="External Link"
        highlightColor={CONTENT_COLORS.Xref}
        columns={2}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={this.props.onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders"/></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }
}
