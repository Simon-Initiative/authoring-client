import * as React from 'react';
import * as Types from './types';
import guid from '../../../utils/guid';
import { DropTarget } from 'react-dnd';
import { DragTypes } from '../../../utils/drag';

export interface RepositionTarget {

}

export interface RepositionTargetProps {
  index: number;
  onDrop: Types.OnDropHandler;
  canDrop: Types.CanDropHandler;
  parentModel: any;
}

export interface RepositionTargetState {

}

// tslint:disable-next-line
const boxTarget = {
  drop(props: RepositionTargetProps, monitor, component) {
    const hasDroppedOnChild = monitor.didDrop();
    if (hasDroppedOnChild && !(props as any).greedy) {
      return;
    }

    props.onDrop(
      component.props.draggedItem.sourceModel, component.props.draggedItem.parentModel.guid,
      props.parentModel, props.index);
  },
  canDrop(props: RepositionTargetProps, monitor) {
    return props.canDrop(
      monitor.getItem().id,
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
}))export class RepositionTarget
  extends React.Component<RepositionTargetProps, RepositionTargetState> {

  constructor(props) {
    super(props);
  }

  render() {

    const isOver = (this.props as any).isOver;
    const canDrop = (this.props as any).canDrop;
    const draggedItem = (this.props as any).draggedItem;

    const delta =  draggedItem === null ? 0 : draggedItem.index - this.props.index;

    const directlyAboveOrBelow = delta === 0 || delta === -1;

    const opacity = (isOver && canDrop && !directlyAboveOrBelow) ? 1.0 : 0.5;

    const style = {
      backgroundColor: '#f4bf42',
      opacity,
      height: '10px',
      width: '100%',
      marginBottom: '8px',

    };

    return (this.props as any).connectDropTarget(
      <div style={style}/>,
    );
  }

}

