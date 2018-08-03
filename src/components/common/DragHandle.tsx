import * as React from 'react';

import './DragHandle.scss';

export interface DragHandleProps {
  connectDragSource?: any;
  hidden?: boolean;
}

export interface DragHandleState {

}

export class DragHandle
  extends React.Component<DragHandleProps, DragHandleState> {

  render() {
    const { connectDragSource } = this.props;
    console.log('this.props', this.props);

    const dragHandle = (
      <div className={`dragHandleGrab ${this.props.hidden ? 'invisible' : ''}`}>
        <div className="grip" />
      </div>
    );

    return connectDragSource ? this.props.connectDragSource(dragHandle) : dragHandle;
  }
}
