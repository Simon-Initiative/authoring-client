import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { Select } from 'editors/content/common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { CommandType, CommandStyle } from 'data/content/learning/command';

import '../common/draft/decorators/styles.scss';

export interface CommandEditorProps
  extends AbstractContentEditorProps<contentTypes.Command> {
  onShowSidebar: () => void;
}

export interface CommandEditorState {

}

/**
 * React Component
 */
export default class CommandEditor
  extends AbstractContentEditor
  <contentTypes.Command, CommandEditorProps & JSSProps, CommandEditorState> {

  constructor(props) {
    super(props);
  }

  renderMain() {
    return (
      <div className="command">
        Command
      </div>
    );
  }

  renderSidebar() {
    const { editMode, model, onEdit } = this.props;


    return (
      <SidebarContent title="Command">
        <SidebarGroup label="Target">

        </SidebarGroup>
        <SidebarGroup label="Type">
          <Select
            editMode={editMode}
            label=""
            value={model.commandType}
            onChange={(commandType: CommandType) => onEdit(model.with({ commandType }))}>
            <option key={CommandType.Message} value={CommandType.Message}>Message</option>
            <option key={CommandType.Broadcast} value={CommandType.Broadcast}>Broadcast</option>
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Style">
          <Select
            editMode={editMode}
            label=""
            value={model.style}
            onChange={(style: CommandStyle) => onEdit(model.with({ style }))}>
            <option key={CommandStyle.Button} value={CommandStyle.Button}>Button</option>
            <option key={CommandStyle.Link} value={CommandStyle.Link}>Link</option>
          </Select>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Command" columns={2} highlightColor={CONTENT_COLORS.Command}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-sliders" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }
}
