import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import { Custom } from 'data/content/assessment/custom';
import { isReplActivity } from 'editors/content/utils/common';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
// TODO: Add ReplEditor
// import { ReplEditor }
//   from 'editors/content/learning/repl/ReplEditor.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './EmbedActivityEditor.bak.styles';

export interface EmbedActivityProps extends AbstractContentEditorProps<Custom> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface EmbedActivityState {

}

class EmbedActivity
  extends AbstractContentEditor<Custom,
  StyledComponentProps<EmbedActivityProps, typeof styles>, EmbedActivityState> {

  constructor(props) {
    super(props);
  }

  renderSidebar(): JSX.Element {
    const { editMode, model, onEdit } = this.props;

    return (
      <SidebarContent title="Custom">
        <SidebarGroup>
          <SidebarRow label="Type">
            <Discoverable id={DiscoverableId.EmbedActivityDetails} focusChild>
              [Embed Activity]
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
            onDiscover(DiscoverableId.EmbedActivityDetails);
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
        {isReplActivity(model.src)
          ? <div>Repl Activity</div>
          : (
            <div className={classes.customEditorOther}>
              Embed Activity
            </div>
          )
        }
      </div>
    );
  }
}

const StyledEmbedActivity = withStyles<EmbedActivityProps>(styles)(EmbedActivity);
export { StyledEmbedActivity as EmbedActivity };
