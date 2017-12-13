
import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { InputLabel } from '../common/InputLabel';
import { DragTypes } from 'utils/drag';
import { DragSource, DropTarget } from 'react-dnd';
import { RepositionTarget } from 'editors/common/tree/RepositionTarget.tsx';
import { Maybe } from 'tsmonad';
import { Remove } from 'components/common/Remove';
import { DragHandle } from 'components/common/DragHandle.tsx';
import { convert } from 'utils/format';

import './Choice.scss';

interface ChoiceDropTargetProps {
  connectDropTarget?: any;
  isHovered?: boolean;
  index: number;
  canDrop?: boolean;
  onDragDrop?: (originalIndex: number, newIndex: number) => void;
}

interface ChoiceDropTargetState {

}

const target = {
  drop(props, monitor) {
    const originalIndex = monitor.getItem().index;
    props.onDragDrop(originalIndex, props.index);
  },
  canDrop(props, monitor) {
    const originalIndex = monitor.getItem().index;
    return !(props.index === (originalIndex - 1) || props.index === originalIndex);
  },
};

@DropTarget(DragTypes.Choice, target, (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isHovered: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
})
class ChoiceDropTarget extends React.Component<ChoiceDropTargetProps, ChoiceDropTargetState> {
  render() {
    const { connectDropTarget, isHovered, canDrop } = this.props;

    return connectDropTarget(
      <div className={`choice-drop-target ${isHovered && canDrop ? 'hover' :''}`} />,
    );
  }
}

export interface ChoiceProps extends AbstractContentEditorProps<contentTypes.Choice> {
  onRemove: (choice: contentTypes.Choice) => void;
  label?: string;
  connectDragSource?: any;
  connectDragPreview?: any;
  isDraggable?: boolean;
  index?: number;
  onDragDrop?: (originalIndex: number, newIndex: number) => void;
}

export interface ChoiceState {

}

const source = {
  canDrag(props) {
    return props.editMode;
  },
  beginDrag(props) {
  /* code here */
    console.log('begin drag', props);
    return {
      index: props.index,
    };
  },
  endDrag(props) {
  /* code here */
    console.log('end drag', props);
    return {
      index: props.index,
    };
  },
};

const sourceCollect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
};

/**
 * The content editor for HtmlContent.
 */
@DragSource(DragTypes.Choice, source, sourceCollect)
export class Choice
  extends AbstractContentEditor<contentTypes.Choice, ChoiceProps, ChoiceState> {

  constructor(props) {
    super(props);

    this.onBodyEdit = this.onBodyEdit.bind(this);
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({ body });
    this.props.onEdit(concept);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.label !== this.props.label) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {
    const { isDraggable, index, connectDragSource, connectDragPreview, onDragDrop } = this.props;

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const insertionToolbar = <InlineInsertionToolbar/>;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    const label = this.props.label === undefined
      ? this.props.index === undefined ? 'Choice' : convert.toAlphaNotation(this.props.index)
      : this.props.label;

    const draggableComponent = (
      <div
        className="choice-content">
        {isDraggable && connectDragSource(
          <div><DragHandle /></div>,
        )}
        <HtmlContentEditor
            editorStyles={bodyStyle}
            inlineToolbar={inlineToolbar}
            blockToolbar={blockToolbar}
            inlineInsertionToolbar={insertionToolbar}
            {...this.props}
            model={this.props.model.body}
            onEdit={this.onBodyEdit} />
      </div>
    );

    return (
      <div className="choice">
        <div className="choice-item">
          <div className="choice-label">
            {label}
          </div>
          {isDraggable ? connectDragPreview(draggableComponent) : draggableComponent}
          <Remove
            editMode={this.props.editMode}
            onRemove={this.props.onRemove.bind(this, this.props.model)} />
        </div>
        <div className="choice-drop-target-container">
          <ChoiceDropTarget index={index} onDragDrop={onDragDrop} />
        </div>
      </div>
    );
  }
}
