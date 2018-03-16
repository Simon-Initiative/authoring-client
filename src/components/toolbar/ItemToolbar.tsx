import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { ActiveContextState } from 'reducers/active';
import { ParentContainer } from 'types/active';

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
      just: ac => ac,
      nothing: () => undefined,
    });


    const container: ParentContainer = activeContext.container.caseOf({
      just: ac => ac,
      nothing: () => undefined,
    });


    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
              onClick={() => console.log('NOT IMPLEMENTED')}
              tooltip="Duplicate Item"
              size={ToolbarButtonSize.Wide}
              disabled={!hasSelection}>
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
              disabled={!hasSelection}>
              <i className="fa fa-close"/> Remove
          </ToolbarButton>
        </ToolbarLayout.Column>
          <ToolbarLayout.Column>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Move Item Up"
                size={ToolbarButtonSize.Small}
                disabled={!hasSelection}>
                <i className="fa fa-long-arrow-up"/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Move Item Down"
                size={ToolbarButtonSize.Small}
                disabled={!hasSelection}>
                <i className="fa fa-long-arrow-down"/>
            </ToolbarButton>
          </ToolbarLayout.Column>
      </React.Fragment>
    );
  });
