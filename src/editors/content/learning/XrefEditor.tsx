import * as React from 'react';
import { injectSheet, JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Select, TextInput } from '../common/controls';
import { LegacyTypes } from 'data/types';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import styles from './Entity.style';

export interface XrefEditorProps
  extends AbstractContentEditorProps<contentTypes.Xref> {
  onShowSidebar: () => void;
}

export interface XrefEditorState {

}

/**
 * React Component
 */
@injectSheet(styles)
export default class XrefEditor
    extends AbstractContentEditor
    <contentTypes.Xref, XrefEditorProps & JSSProps, XrefEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    const { editMode, model, onEdit, context } = this.props;

    const pages = context.courseModel.resources
      .toArray()
      .filter(resource => resource.type === LegacyTypes.workbook_page)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <SidebarContent title="Cross Reference">
        <SidebarGroup label="">
          <SidebarRow label="Page to link to">
            <Select
              editMode={this.props.editMode}
              label=""
              value={model.page}
              onChange={page => onEdit(model.with({ page }))}>
              {pages}
            </Select>
          </SidebarRow>
          <SidebarRow label="Element to link to">
            <TextInput
              editMode={this.props.editMode}
              label=""
              width="100%"
              type="string"
              value={model.idref}
              onEdit={idref => onEdit(model.with({ idref }))} />
          </SidebarRow>
          <SidebarRow label="Target">
            <Select
              editMode={editMode}
              value={model.target}
              onChange={v =>
                onEdit(model.with({ target: v === 'self' ? LinkTarget.Self : LinkTarget.New }))}>
              <option value={LinkTarget.Self}>Open in this window</option>
              <option value={LinkTarget.New}>Open in new window</option>
            </Select>
          </SidebarRow>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Cross-reference" columns={2} highlightColor={CONTENT_COLORS.Xref}>
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
