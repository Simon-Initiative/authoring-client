import * as React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { Html } from 'data/content/html.ts';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { DragHandle } from 'components/common/DragHandle.tsx';
import { Remove } from 'components/common/Remove';
import { DragTypes } from 'utils/drag';

import './InputList.scss';

const HTML_CONTENT_EDITOR_STYLE = {
  minHeight: '20px',
  borderStyle: 'none',
  borderWith: 1,
  borderColor: '#AAAAAA',
};

export interface InputListProps {
  className?: string;
}

export const InputList: React.StatelessComponent<InputListProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`input-list ${className || ''}`}>
      {children}
    </div>
  );
};

interface InputItemDropTargetProps {
  connectDropTarget?: any;
  isHovered?: boolean;
  index: number;
  canDrop?: boolean;
  onDragDrop?: (originalIndex: number, newIndex: number) => void;
}

interface InputItemDropTargetState {

}

const target = {
  drop(props, monitor) {
    const originalIndex = monitor.getItem().index;
    props.onDragDrop(originalIndex, props.index);
  },
  canDrop(props, monitor) {
    const originalIndex = monitor.getItem().index;
    return !(props.index === originalIndex || props.index === (originalIndex + 1));
  },
};

@DropTarget(DragTypes.Choice, target, (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isHovered: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
})
class InputItemDropTarget
  extends React.Component<InputItemDropTargetProps, InputItemDropTargetState> {
  render() {
    const { connectDropTarget, isHovered, canDrop } = this.props;

    return connectDropTarget(
      <div className={`drop-target ${isHovered && canDrop ? 'hover' :''}`} />,
    );
  }
}

const source = {
  canDrag(props) {
    return props.editMode;
  },
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
  endDrag(props) {
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

export interface InputListItemProps {
  className?: string;
  id: string;
  label: string;
  contentTitle?: string;
  context: AppContext;
  services: AppServices;
  body: Html;
  options?: any;
  controls?: any;
  editMode: boolean;
  isDraggable?: boolean;
  index?: number;                   // required if draggable
  connectDragSource?: any;          // required if draggable
  connectDragPreview?: any;         // required if draggable
  onDragDrop?: (originalIndex: number, newIndex: number) => void;
  onEdit: (body: Html) => void;
  onRemove?: (id: string) => void;
}

@DragSource(DragTypes.Choice, source, sourceCollect)
export class InputListItem extends React.PureComponent<InputListItemProps> {
  render() {
    const {
      className,
      children,
      id,
      label,
      contentTitle,
      context,
      services,
      body,
      options,
      controls,
      editMode,
      isDraggable,
      index,
      connectDragSource,
      connectDragPreview,
      onDragDrop,
      onEdit,
      onRemove,
    } = this.props;

    const elementChildren = React.Children.toArray(children)
      .map((element: React.ReactElement<any>): React.ReactElement<any> =>
        React.cloneElement(element, { editMode }),
      );

    const itemOptionRows = elementChildren.filter(
      (child: React.ReactElement<any>): boolean => child.type === ItemOptions,
    );

    const itemControls = elementChildren.filter(
      (child: React.ReactElement<any>): boolean => child.type === ItemControl,
    );

    return (
      <div className={`input-list-item ${className || ''}`}>
        <div className="input-list-item-label">
          <div className="label-text">
            {label}
          </div>
          {isDraggable && connectDragSource(
            <div className="item-drag-handle"><DragHandle /></div>,
          )}
          {controls}
        </div>
        <div className="input-list-item-content">
          <div className="drop-target-container">
            <InputItemDropTarget index={index} onDragDrop={onDragDrop} />
          </div>
          {contentTitle
            ? (<div className="input-list-item-content-title">{contentTitle}</div>)
            : (null)
          }
          <HtmlContentEditor
            editorStyles={HTML_CONTENT_EDITOR_STYLE}
            inlineToolbar={<InlineToolbar/>}
            blockToolbar={<BlockToolbar/>}
            inlineInsertionToolbar={<InlineInsertionToolbar/>}
            context={context}
            services={services}
            editMode={editMode}
            model={body}
            onEdit={onEdit} />
          {options}
        </div>
        {onRemove
          ? (
            <Remove
              className={contentTitle ? 'content-title-btn-offset' : ''}
              editMode={editMode}
              onRemove={() => onRemove(id)} />
          )
          : (
            <span className="remove-btn"></span>
          )
        }
      </div>
    );
  }
}

export interface ItemControlProps {
  className?: string;
}

export const ItemControl: React.StatelessComponent<ItemControlProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`input-list-item-control ${className || ''}`}>
      {children}
    </div>
  );
};

export interface ItemOptionsProps {
  className?: string;
}

export const ItemOptions: React.StatelessComponent<ItemOptionsProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`input-list-item-options ${className || ''}`}>
      {children}
    </div>
  );
};

export interface ItemOptionProps {
  className?: string;
  label: string;
  flex?: boolean;
}

export const ItemOption: React.StatelessComponent<ItemOptionProps> = ({
  className,
  children,
  label,
  flex,
}) => {
  return (
    <div className={`input-list-item-option ${className || ''} ${flex ? 'flex-spacer' : ''}`}>
        <div className="option-label">
          {label}
        </div>
        <div className="option-content">
          {children}
        </div>
    </div>
  );
};

export const ItemOptionFlex: React.StatelessComponent<{}> = () => {
  return (
    <div className="flex-spacer" />
  );
};
