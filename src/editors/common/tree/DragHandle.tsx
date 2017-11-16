import * as React from 'react';
import guid from '../../../utils/guid';
import { DragSource } from 'react-dnd';
import { DragTypes } from '../../../utils/drag';

import './DragHandle.scss';

export interface DragHandle {
  
}

export interface DragHandleProps {
  connectDragSource: any; 
}

export interface DragHandleState {

}

export class DragHandle 
  extends React.Component<DragHandleProps, DragHandleState> {
    
  render() {
    return this.props.connectDragSource(
      <div className="dragHandleGrab">
        <span>
          <i className="icon icon-reorder"></i>
        </span>
      </div>,
    ); 
  }

}

