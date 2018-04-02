import * as React from 'react';
import { injectSheet, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LinkTarget, PurposeTypes } from 'data/content/learning/common';
import { Select } from '../common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import styles from './Entity.style';
import { LegacyTypes } from 'data/types';

export interface ActivityLinkEditorProps
  extends AbstractContentEditorProps<contentTypes.ActivityLink> {
  onShowSidebar: () => void;
}

export interface ActivityLinkEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export default class ActivityLinkEditor
    extends AbstractContentEditor
    <contentTypes.ActivityLink, ActivityLinkEditorProps & JSSProps, ActivityLinkEditorState> {

  constructor(props) {
    super(props);
  }

  renderMain() {
    return null;
  }

  renderSidebar() {
    const { editMode, model, onEdit, context } = this.props;

    const highStakesOptions = context.courseModel.resources
      .toArray()
      .filter(resource => resource.type === LegacyTypes.assessment2)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <SidebarContent title="Activity Link">
        <SidebarGroup label="Activity">
        <Select
          editMode={this.props.editMode}
          label=""
          value={model.idref}
          onChange={idref => onEdit(model.with({ idref }))}>
          {highStakesOptions}
        </Select>
        </SidebarGroup>
        <SidebarGroup label="Purpose">
        <Select
          editMode={this.props.editMode}
          label=""
          value={model.purpose}
          onChange={purpose => onEdit(model.with({ purpose }))}>
          {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
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
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Activity Link" columns={2} highlightColor={CONTENT_COLORS.Xref}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-sliders"/></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }
}
