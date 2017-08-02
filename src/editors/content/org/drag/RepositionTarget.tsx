import * as React from 'react';
import guid from '../../../../utils/guid';
import { DropTarget } from 'react-dnd';
import { DragTypes } from '../../../../utils/drag';

export interface RepositionTarget {
  
}

export interface RepositionTargetProps {
  index: number;
  onDrop: (sourceModel: any, sourceParentGuid: string, targetGuid: string, index: number) => void;
  canAcceptId: (id: string) => boolean;
  parentModel: string;
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

    props.onDrop(
      component.props.draggedItem.source, component.props.draggedItem.parentGuid, 
      props.parentModel, props.index);
  },
  canDrop(props, monitor) {
    return props.canAcceptId(
      monitor.getItem().id, monitor.getItem().source, monitor.getItem().index, 
      props.index, monitor.getItem().parentGuid);
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

    const opacity = (isOver && canDrop) ? 1.0 : 0.0;

    const style = {
      backgroundColor: '#f4bf42',
      opacity,
      height: '7px',
      width: '100%',
      marginBottom: '6px',
    };

    return (this.props as any).connectDropTarget(
      <div style={style}/>,
    ); 
  }

}

