import * as React from 'react';
import guid from '../../../utils/guid';
import { DragSource } from 'react-dnd';
import { DragTypes } from '../../../utils/drag';
import { SourceNodeType } from '../../content/org/drag/utils';

import 'DraggableNode.scss';

export interface DraggableNode {

}

export interface DraggableNodeProps {
  id: string;
  editMode: boolean;
  index: number;
  source: SourceNodeType;
  parentModel: any;
}

export interface DraggableNodeState {

}

// tslint:disable-next-line
const NodeSource = {
  canDrag(props) {
    return props.editMode;
  },

  beginDrag(props, monitor) {
    return {
      id: props.id,
      originalIndex: props.index,
      sourceModel: props.source,
      parentModel: props.parentModel,
    };
  },
};

/**
 * Isolate the drag and drop assessment node reordering.
 */
@DragSource(DragTypes.AssessmentNode, NodeSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export class DraggableNode
  extends React.PureComponent<DraggableNodeProps, DraggableNodeState> {

  constructor(props) {
    super(props);
  }

  render() {

    const isDragging = (this.props as any).isDragging;
    const connectDragSource = (this.props as any).connectDragSource;

    const opacity = isDragging ? 0.0 : 1;

    return (this.props as any).connectDragPreview(
      <div className="draggable-tree-node" style={{ opacity }}>
        {React.Children.map(
          this.props.children,
          ((child) => {
            const additionalProps = (child as any).type === 'span'
              ? {} : { connectDragSource };
            return React.cloneElement((child as any), additionalProps);
          }))}
      </div>,
    );
  }

}

