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
        <div className="grip" />
      </div>
    );

    return connectDragSource ? this.props.connectDragSource(dragHandle) : dragHandle;
  }
}
