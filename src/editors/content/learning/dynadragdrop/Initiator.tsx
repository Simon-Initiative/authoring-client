import * as React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';
import { DragHandle } from 'components/common/DragHandle';
import { DragTypes } from 'utils/drag';
import { Remove } from 'components/common/Remove';

import { styles } from './Initiator.styles';

export interface InitiatorProps {
  className?: string;
  model: InitiatorModel;
  editMode: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onRemove?: (guid: string) => void;
  onDelete?: (guid: string) => void;

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
      index: props.model.guid,
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
    const { className, classes, children, model, editMode, selected,
      connectDragSource, connectDragPreview, onSelect, onRemove,
      onDelete } = this.props;

    return connectDragSource(connectDragPreview(
      <div
        className={classNames(['Initiator', classes.initiator,
          onSelect && classes.selectable,
          selected && classes.selected])}
        style={{
          fontWeight: model.fontWeight as any,
          fontSize: model.fontWeight,
          fontStyle: model.fontStyle as any,
          textDecoration: model.textDecoration,
        }}
        onClick={() => onSelect && onSelect(model.assessmentId)}>
        <DragHandle />

        {model.text}

        {onRemove &&
          <Remove
            className={classes.removeBtn}
            editMode={editMode}
            onRemove={(e) => {
              e.stopPropagation();
              onRemove(model.guid);
            }} />
        }
        {onDelete &&
          <Remove
            className={classes.removeBtn}
            customIcon="fa fa-trash"
            editMode={editMode}
            onRemove={(e) => {
              e.stopPropagation();
              onDelete(model.guid);
            }} />
        }
      </div>,
    ));
  }
}
