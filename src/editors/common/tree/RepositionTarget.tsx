import * as React from 'react';
import { Maybe } from 'tsmonad';
import * as Types from './types';
import guid from '../../../utils/guid';
import { DropTarget } from 'react-dnd';
import { DragTypes } from '../../../utils/drag';

export interface RepositionTargetProps<NodeType extends Types.HasGuid> {
  index: number;
  onDrop: Types.OnDropHandler<NodeType>;
  canDrop: Types.CanDropHandler<NodeType>;
  parentModelId: Maybe<string>;
  parentModel: Maybe<any>;
  editMode: boolean;
}

export interface RepositionTargetState {

}

// tslint:disable-next-line
const boxTarget = {
  drop(props: RepositionTargetProps<any>, monitor, component) {
    const hasDroppedOnChild = monitor.didDrop();
    if (hasDroppedOnChild && !(props as any).greedy) {
      return;
    }

    const parent = component.props.draggedItem.parentModel;

    props.onDrop(
      component.props.draggedItem.sourceModel,
      parent,
      props.parentModel,
      component.props.draggedItem.originalIndex,
      props.index,
    );
  },
  canDrop(props: RepositionTargetProps<any>, monitor) {
    return props.editMode && props.canDrop(
      monitor.getItem().sourceModel,
      monitor.getItem().parentModel,
      monitor.getItem().originalIndex,
      props.parentModel,
      props.index);
  },
};

/**
 * Isolate the drag and drop assessment node reordering.
 */
@DropTarget(DragTypes.AssessmentNode, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
  draggedItem: monitor.getItem(),
}))export class RepositionTarget<NodeType extends Types.HasGuid>
  extends React.Component<RepositionTargetProps<NodeType>, RepositionTargetState> {

  constructor(props) {
    super(props);
  }

  render() {

    const isOver = (this.props as any).isOver;
    const canDrop = (this.props as any).canDrop;
    const draggedItem = (this.props as any).draggedItem;

    const delta =  draggedItem === null ? 0 : draggedItem.originalIndex - this.props.index;

    const opacity = (isOver && canDrop) ? 1.0 : 0.0;

    const style = {
      backgroundColor: '#f4bf42',
      opacity,
      height: '10px',
      width: '100%',
      marginBottom: '8px',
      zIndex: 9999,
    };

    return (this.props as any).connectDropTarget(
      <div style={style}/>,
    );
  }

}

