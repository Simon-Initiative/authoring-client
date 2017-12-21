import * as React from 'react';
import { DragSource } from 'react-dnd';

import './DragHandle.scss';

export interface DragHandleProps {
  connectDragSource?: any;
}

export interface DragHandleState {

}

export class DragHandle
  extends React.Component<DragHandleProps, DragHandleState> {

  render() {
    const { connectDragSource } = this.props;

    const dragHandle = (
      <div className="dragHandleGrab">
        <span>
          <i className="icon icon-reorder"></i>
        </span>
      </div>
    );

    return connectDragSource ? this.props.connectDragSource(dragHandle) : dragHandle;
  }

}

