import * as React from 'react';
import { ComponentProps } from 'types/component';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';

export interface ActionsToolbarProps {
  onShowPageDetails: () => void;
}

/**
 * ActionsToolbar React Stateless Component
 */
export const ActionsToolbar = (({ onShowPageDetails }: ComponentProps<ActionsToolbarProps>) => {
  return (
    <React.Fragment>
      <ToolbarLayout.Column>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            size={ToolbarButtonSize.Wide}>
          <i className={'fa fa-undo'}/> Undo
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            size={ToolbarButtonSize.Wide}>
          <i className={'fa fa-repeat'}/> Redo
        </ToolbarButton>
      </ToolbarLayout.Column>
      <ToolbarLayout.Inline>
        <ToolbarButton
            onClick={() => onShowPageDetails()}
            tooltip="View and Edit Page Details"
            size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-info-circle"/></div>
          <div>Details</div>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            size={ToolbarButtonSize.Large}
            tooltip="Delete this Page"
            disabled>
          <div><i className="fa fa-trash-o"/></div>
          <div>Delete</div>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Preview this Page"
            size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-eye"/></div>
          <div>Preview</div>
        </ToolbarButton>
      </ToolbarLayout.Inline>
    </React.Fragment>
  );
});
