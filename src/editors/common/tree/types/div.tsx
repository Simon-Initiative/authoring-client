import * as React from 'react';
import { Maybe } from 'tsmonad';

import * as Types from '../types';
import { RepositionTarget } from '../RepositionTarget';

import { DragSource } from 'react-dnd';
import { DragTypes } from 'utils/drag';

import './div.scss';

// A simple div based tree renderer.


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
export class DraggableNode
  extends React.PureComponent<DraggableNodeProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {

    const isDragging = (this.props as any).isDragging;
    const connectDragSource = (this.props as any).connectDragSource;

    const opacity = isDragging ? 0.4 : 1;

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

export function buildRenderer<NodeType extends Types.HasGuid>(): Types.TreeRenderer<NodeType> {

  return {
    renderTree: children => (
      <div className="tree-container">
        <div className="tree-list">
          {children}
        </div>
      </div>
    ),

    renderNode: (
      nodeId, node, nodeState, renderedNode, dropTarget, indexWithinParent, editMode) => {

      return (
        <div className="div-node" key={nodeId}>
          <DraggableNode editMode={editMode} id={nodeId} sourceModel={node}
            index={indexWithinParent} parentModel={nodeState.parentNode} >
            {renderedNode}
          </DraggableNode>
          {dropTarget}
        </div>
      );
    },

    renderDropTarget: (
      index: number,
      onDrop: Types.OnDropHandler<NodeType>,
      canDrop: Types.CanDropHandler<NodeType>,
      parentModel: Maybe<NodeType>,
      parentModelId: Maybe<string>,
      isBottom: boolean,
      editMode: boolean): JSX.Element => {

      const props = {
        index,
        onDrop,
        canDrop,
        parentModel,
        parentModelId,
        editMode,
      };

      const dropClass = isBottom ? 'bottom-drop' : 'top-drop';

      return (
        <div className={dropClass}>
          <RepositionTarget {...props} />
        </div>
      );

    },
  };
}
