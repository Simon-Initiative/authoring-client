import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/controls';
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
    const { editMode, model, onEdit } = this.props;

    return (
      <SidebarContent title="Citation">
        <SidebarGroup label="">
          <SidebarRow label="Entry">
            <TextInput
              editMode={editMode}
              width="100%"
              label=""
              value={model.entry}
              type="string"
              onEdit={entry => onEdit(model.with({ entry }))}
            />
          </SidebarRow>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Citation" columns={3} highlightColor={CONTENT_COLORS.Cite}>
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
