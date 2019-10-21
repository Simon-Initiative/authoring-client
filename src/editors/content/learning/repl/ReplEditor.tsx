import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './ReplEditor.styles';
import { EmbedActivityModel } from 'data/models/embedactivity';

export interface ReplEditorProps extends AbstractContentEditorProps<EmbedActivityModel> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface ReplEditorState {

}

class ReplEditor
  extends AbstractContentEditor<EmbedActivityModel,
  StyledComponentProps<ReplEditorProps, typeof styles>, ReplEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar(): JSX.Element {
    const { editMode, model, onEdit } = this.props;

    return (
      <SidebarContent title="Custom">
        <SidebarGroup>
          <SidebarRow label="Type">
            <Discoverable id={DiscoverableId.ReplEditorDetails} focusChild>
              [Repl Activity Controls]
            </Discoverable>
          </SidebarRow>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Custom} columns={3}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.ReplEditorDetails);
          }} size={ToolbarButtonSize.Large}>
          <div><i className="fas fa-sliders-h" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { className, classes, model } = this.props;

    return (
      <div className={classNames([classes.customEditor, className])}>
        <div>Repl Activity</div>
      </div>
    );
  }
}

const StyledReplEditor = withStyles<ReplEditorProps>(styles)(ReplEditor);
export { StyledReplEditor as ReplEditor };
