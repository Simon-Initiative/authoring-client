import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
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
  onClearSelection: () => void;
  onCut: (item) => void;
  onCopy: (item) => void;
  onRemove: (item) => void;
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

    const canMoveUp = true;
    const canMoveDown = true;

    // const onCut = (item) => {
    //   onCopy(item);
    //   container.onRemove(item);
    // };

    // const onCopy = (item) => {
    //   // Add contents to clipboard:
    //   // Input element must be selected to copy to clipboard.
    //     // Create html input element with contents
    //     // inputElement.select()
    //     // document.execCommand('copy')
    //     // Remove html input
    // };

    // const onPaste = () => {
    //   const { model } = this.props;

    //   // How to create element from clipboard contents?
    //   const active = { clone : () => {} };

    //   // How to get guid of actively selected element?
    //   const activeContentGuid = undefined;
    //   const index = indexOf(activeContentGuid, model);

    //   const duplicate = (active.clone() as any).with({
    //     guid: guid(),
    //   });
    //   container.onEdit(this.insertAfter(model, duplicate, index), duplicate);

    //   // Should onSelect be added to the interface?
    //   // container.onSelect(duplicate);
    // };

    const onRemove = () => {
      onClearSelection();

      activeContext.textSelection.caseOf({
        just: (textSelection) => {
          if (item instanceof contentTypes.ContiguousText) {
            const text = item as contentTypes.ContiguousText;
            const entity = text.getEntityAtCursor(textSelection);
            entity.caseOf({
              just: (e) => {
                const updated = text.removeEntity(e.key);
                container.onEdit(updated, updated);
              },
              nothing: () => container.onRemove(item),
            });
          } else {
            container.onRemove(item);
          }
        },
        nothing: () => {
          container.onRemove(item);
        },
      });
    };

    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
              onClick={() => this.props.onCut(item)}
              tooltip="Cut Item"
              size={ToolbarButtonSize.Wide}
              disabled={!(hasSelection && canDuplicate)}>
            <i className="fa fa-cut"/> Cut
          </ToolbarButton>
          <ToolbarButton
              onClick={() => this.props.onCopy(item)}
              tooltip="Copy Item"
              size={ToolbarButtonSize.Wide}
              disabled={!(hasSelection && canDuplicate)}>
            <i className="fa fa-copy"/> Copy
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
        <ToolbarButton
              onClick={() => this.props.onPaste(item)}
              tooltip="Paste Item"
              size={ToolbarButtonSize.Wide}
              disabled={!(hasSelection && canDuplicate)}>
            <i className="fa fa-paste"/> Paste
          </ToolbarButton>
          {/* <ToolbarButton
              onClick={() => container.onDuplicate(item)}
              tooltip="Duplicate Item"
              size={ToolbarButtonSize.Wide}
              disabled={!(hasSelection && canDuplicate)}>
            <i className="fa fa-files-o"/> Duplicate
          </ToolbarButton> */}
          <ToolbarButton
              className={classes.removeButton}
              onClick={onRemove}
              tooltip="Remove Item"
              size={ToolbarButtonSize.Wide}
              disabled={!(hasSelection)}>
              <i className="fa fa-close"/> Remove
          </ToolbarButton>
        </ToolbarLayout.Column>
          <ToolbarLayout.Column>
            <ToolbarButton
                onClick={() => container.onMoveUp(item)}
                tooltip="Move Item Up"
                size={ToolbarButtonSize.Small}
                disabled={!(hasSelection && canMoveUp)}>
                <i className="fa fa-long-arrow-up"/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => container.onMoveDown(item)}
                tooltip="Move Item Down"
                size={ToolbarButtonSize.Small}
                disabled={!(hasSelection && canMoveDown)}>
                <i className="fa fa-long-arrow-down"/>
            </ToolbarButton>
          </ToolbarLayout.Column>
      </React.Fragment>
    );
  });
