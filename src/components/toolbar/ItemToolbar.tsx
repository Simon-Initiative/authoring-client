import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { ActiveContextState } from 'reducers/active';
import { ParentContainer } from 'types/active';
import { WbInline } from 'data/content/workbook/wbinline.ts';

import styles from './ItemToolbar.style';

export interface ItemToolbarProps {
  context: AppContext;
  courseModel: CourseModel;
  activeContext: ActiveContextState;
  onClearSelection: () => void;
}

/**
 * InsertToolbar React Stateless Component
 */
export const ItemToolbar: React.StatelessComponent<ItemToolbarProps>
  = injectSheetSFC<ItemToolbarProps>(styles)(({
    classes, activeContext, courseModel, onClearSelection,
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

    const canRemove = true;
    const canMoveUp = true;
    const canMoveDown = true;

    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
              onClick={() => container.onDuplicate(item)}
              tooltip="Duplicate Item"
              size={ToolbarButtonSize.Wide}
              disabled={!(hasSelection && canDuplicate)}>
            <i className="fa fa-files-o"/> Duplicate
          </ToolbarButton>
          <ToolbarButton
              className={classes.removeButton}
              onClick={() => {
                onClearSelection();
                container.onRemove(item);
              }}
              tooltip="Remove Item"
              size={ToolbarButtonSize.Wide}
              disabled={!(hasSelection && canRemove)}>
              <i className="fa fa-close"/> Remove
          </ToolbarButton>
        </ToolbarLayout.Column>
          <ToolbarLayout.Column>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Move Item Up"
                size={ToolbarButtonSize.Small}
                disabled={!(hasSelection && canMoveUp)}>
                <i className="fa fa-long-arrow-up"/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Move Item Down"
                size={ToolbarButtonSize.Small}
                disabled={!(hasSelection && canMoveDown)}>
                <i className="fa fa-long-arrow-down"/>
            </ToolbarButton>
          </ToolbarLayout.Column>
      </React.Fragment>
    );
  });
