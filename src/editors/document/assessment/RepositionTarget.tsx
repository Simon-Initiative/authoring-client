import * as React from 'react';
import guid from '../../../utils/guid';
import { DropTarget } from 'react-dnd';
import { DragTypes } from '../../../utils/drag';

export interface RepositionTarget {
  
}

export interface RepositionTargetProps {
  index: number;
  onDrop: (id: string, index: number) => void;
}

export interface RepositionTargetState {

}

// tslint:disable-next-line
const boxTarget = {
  drop(props, monitor, component) {
    const hasDroppedOnChild = monitor.didDrop();
    if (hasDroppedOnChild && !props.greedy) {
      return;
    }

    props.onDrop(component.props.draggedItem.id, props.index);
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

    const opacity = (isOver && canDrop && !directlyAboveOrBelow) ? 1.0 : 0.0;

    const style = {
      backgroundColor: '#f4bf42',
      opacity,
      height: '10px',
      width: '100%',
    };

    return (this.props as any).connectDropTarget(
      <div style={style}/>,
    ); 
  }

}

