import * as React from 'react';
import { Maybe } from 'tsmonad';

import * as Types from '../types';
import { RepositionTarget } from '../RepositionTarget';

import { DragSource } from 'react-dnd';
import { DragTypes } from 'utils/drag';

interface DraggableNodeProps {
  id: string;
  editMode: boolean;
  index: number;
  sourceModel: any;
  parentModel: Maybe<any>;
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
      sourceModel: props.sourceModel,
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
export class DraggableNode<NodeType>
  extends React.PureComponent<DraggableNodeProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {

    const isDragging = (this.props as any).isDragging;
    const connectDragSource = (this.props as any).connectDragSource;

    const opacity = isDragging ? 0.4 : 1;

    return (this.props as any).connectDragPreview(
      <div className="draggable-node" style={{ opacity }}>
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

export function buildRenderer<NodeType>() : Types.TreeRenderer<NodeType> {

  return {
    renderTree: children => <div>{children}</div>,

    renderNode: (nodeId, node, nodeState, renderedNode, indexWithinParent, editMode) => {
      return (
        <DraggableNode editMode={editMode} id={nodeId} sourceModel={node}
          index={indexWithinParent} parentModel={nodeState.parentNode} >
          {renderedNode}
        </DraggableNode>
      );
    },

    renderDropTarget: (
      index: number,
      onDrop: Types.OnDropHandler,
      canDrop: Types.CanDropHandler,
      parentModel: NodeType) : JSX.Element => {

      const props = {
        index,
        onDrop,
        canDrop,
        parentModel,
      };

      return (
        <RepositionTarget {...props}/>
      );

    },
  };
}
