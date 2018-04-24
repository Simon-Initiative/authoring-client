import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { ActiveContextState } from 'reducers/active';
import { ParentContainer } from 'types/active';

import { styles } from './ItemToolbar.styles';

export interface ItemToolbarProps {
  context: AppContext;
  courseModel: CourseModel;
  activeContext: ActiveContextState;
  onCut: (item) => void;
  onCopy: (item) => void;
  onPaste: () => void;
  onRemove: (item) => void;
}

/**
 * InsertToolbar React Stateless Component
 */
export const ItemToolbar: React.StatelessComponent<ItemToolbarProps>
  = injectSheetSFC<ItemToolbarProps>(styles)(({
    classes, activeContext, courseModel, onCut, onCopy, onPaste, onRemove,
  }: StyledComponentProps<ItemToolbarProps>) => {
    const hasSelection = !!activeContext.activeChild.valueOr(false);

    const item: ParentContainer = activeContext.activeChild.caseOf({
      just: activeChild => activeChild,
      nothing: () => undefined,
    });

    const container: ParentContainer = activeContext.container.caseOf({
      just: container => container,
      nothing: () => undefined,
    });

    const canDuplicate = activeContext.activeChild.caseOf({
      just: activeChild => activeChild && ((activeChild as any).contentType !== 'WbInline'),
      nothing: () => false,
    });

    const canMoveUp = true;
    const canMoveDown = true;

    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => onCut(item)}
            tooltip="Cut Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(hasSelection && canDuplicate)}>
            <i className="fa fa-cut" /> Cut
          </ToolbarButton>
          <ToolbarButton
            onClick={() => onCopy(item)}
            tooltip="Copy Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(hasSelection && canDuplicate)}>
            <i className="fa fa-copy" /> Copy
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => onPaste()}
            tooltip="Paste Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(hasSelection)}>
            <i className="fa fa-paste" /> Paste
          </ToolbarButton>
          <ToolbarButton
            className={classes.removeButton}
            onClick={() => onRemove(item)}
            tooltip="Remove Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(hasSelection)}>
            <i className="fa fa-close" /> Remove
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => container.onMoveUp(item)}
            tooltip="Move Item Up"
            size={ToolbarButtonSize.Small}
            disabled={!(hasSelection && canMoveUp)}>
            <i className="fa fa-long-arrow-up" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => container.onMoveDown(item)}
            tooltip="Move Item Down"
            size={ToolbarButtonSize.Small}
            disabled={!(hasSelection && canMoveDown)}>
            <i className="fa fa-long-arrow-down" />
          </ToolbarButton>
        </ToolbarLayout.Column>
      </React.Fragment>
    );
  });
