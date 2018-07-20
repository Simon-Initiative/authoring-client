import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Select, TextInput } from 'editors/content/common/controls';
import { LegacyTypes } from 'data/types';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ResourceState } from 'data/content/resource';

export interface XrefEditorProps
  extends AbstractContentEditorProps<contentTypes.Xref> {
  onShowSidebar: () => void;
}

export interface XrefEditorState {

}

/**
 * React Component
 */
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
      .filter(r => r.type === LegacyTypes.workbook_page &&
        r.resourceState !== ResourceState.DELETED)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <SidebarContent title="Cross Reference">
        <SidebarGroup label="Page to link to">
          <Select
            editMode={this.props.editMode}
            label=""
            value={model.page}
            onChange={page => onEdit(model.with({ page }))}>
            {pages}
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Element to link to">
          <TextInput
            editMode={this.props.editMode}
            label=""
            width="100%"
            type="string"
            value={model.idref}
            onEdit={idref => onEdit(model.with({ idref }))} />
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
      <ToolbarGroup label="Cross-reference" columns={3} highlightColor={CONTENT_COLORS.Xref}>
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
