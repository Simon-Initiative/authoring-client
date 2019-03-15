import * as React from 'react';
import { DragSource } from 'react-dnd';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { DragHandle } from 'components/common/DragHandle';
import { DragTypes } from 'utils/drag';
import { Remove } from 'components/common/Remove';
import { Tooltip } from 'utils/tooltip';

import { styles } from 'editors/content/learning/dynadragdrop/Initiator.styles';

export interface InitiatorProps {
  className?: string;
  model: InitiatorModel;
  editMode: boolean;
  selected?: boolean;
  canDelete?: boolean;
  onSelect?: (id: string) => void;
  onRemove?: (guid: string) => void;
  onDelete?: (guid: string) => void;

  targetId?: string;
  connectDragSource?: any;
  connectDragPreview?: any;
}

export interface InitiatorState {

}

const source = {
  canDrag(props) {
    return props.editMode;
  },
  beginDrag(props) {
    return {
      initiator: props.model.guid,
      originalTargetId: props.targetId,
    };
  },
  endDrag(props) {
    return {
      index: props.model.guid,
    };
  },
};

/**
 * Initiator React Component
 */
@DragSource(
  ({ dragType }) => dragType || DragTypes.DynaDropInitiator,
  source, (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging(),
    };
  })
@injectSheet(styles)
export class Initiator
  extends React.PureComponent<StyledComponentProps<InitiatorProps>,
  InitiatorState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { classes, model, editMode, selected,
      connectDragSource, connectDragPreview, onSelect, onRemove,
      onDelete } = this.props;
    let { canDelete } = this.props;

    if (canDelete) {
      canDelete = true;
    }

    return connectDragSource(connectDragPreview(
      <div
        className={classNames(['Initiator', classes.initiator,
          onSelect && classes.selectable,
          selected && classes.selected])}
        onClick={() => onSelect && onSelect(model.inputVal)}>
        <DragHandle />

        {model.text}

        {onRemove &&
          <Tooltip title="Remove choice from target" delay={1000}>
            <Remove
              className={classes.removeBtn}
              editMode={editMode}
              onRemove={(e) => {
                e.stopPropagation();
                onRemove(model.guid);
              }} />
          </Tooltip>
        }
        {onDelete &&
          <Tooltip
            title={canDelete
              ? 'Delete choice'
              : 'Drag and drop questions must contain at least one choice. '
              + 'Please add another choice before removing.'
            }
            delay={1000}>
            <Remove
              className={classes.removeBtn}
              customIcon="fas fa-trash"
              editMode={editMode && canDelete}
              onRemove={(e) => {
                e.stopPropagation();
                onDelete(model.guid);
              }} />
          </Tooltip>
        }
      </div>,
    ));
  }
}
