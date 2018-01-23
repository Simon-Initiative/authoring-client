import * as React from 'react';

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
          <i className="fa fa-bars"></i>
        </span>
      </div>
    );

    return connectDragSource ? this.props.connectDragSource(dragHandle) : dragHandle;
  }

}

