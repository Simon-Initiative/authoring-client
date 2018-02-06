import * as React from 'react';

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
          <i className="fa fa-bars"></i>
        </span>
      </div>,
    );
  }

}

