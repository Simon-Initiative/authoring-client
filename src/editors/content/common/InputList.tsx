import * as React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from '../container/ContentContainer';
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

export interface InputListItemProps {
  className?: string;
  id: string;
  label: string;
  contentTitle?: string;
  context: AppContext;
  services: AppServices;
  body: ContentElements;
  options?: any;
  controls?: any;
  editMode: boolean;
  onEdit: (body: ContentElements) => void;
  onRemove?: (id: string) => void;

  // required props if draggable
  isDraggable?: boolean;
  index?: number;
  connectDragSource?: any;
  connectDragPreview?: any;
  onDragDrop?: (originalIndex: number, newIndex: number) => void;
  dragType?: string;
  isDragging?: boolean;
  connectDropTarget?: any;
  isHovered?: boolean;
  canDrop?: boolean;
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

const target = {
  drop(props, monitor) {
    const originalIndex = monitor.getItem().index;
    props.onDragDrop(originalIndex, props.index);
  },
  canDrop(props, monitor) {
    const originalIndex = monitor.getItem().index;
    return !(props.index === originalIndex);
  },
};

@DragSource(({ dragType }) => dragType || DragTypes.InputItem, source, (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
})
@DropTarget(({ dragType }) => dragType || DragTypes.InputItem, target, (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isHovered: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
})
export class InputListItem extends React.PureComponent<InputListItemProps> {
  render() {
    const {
      className,
      id,
      label,
      contentTitle,
      context,
      services,
      body,
      options,
      controls,
      editMode,
      onEdit,
      onRemove,
      isDraggable,
      connectDragSource,
      connectDragPreview,
      connectDropTarget,
      isHovered,
      canDrop,
    } = this.props;

    return connectDropTarget(
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
        {connectDragPreview(
          <div className={`input-list-item-content ${isHovered && canDrop ? 'drop-hover' : ''}`}>
            {isHovered && canDrop
              ? (<div className="drop-target-container"/>)
              : (null)
            }
            {contentTitle
                ? (<div className="input-list-item-content-title">{contentTitle}</div>)
                : (null)
              }
              <ContentContainer
                context={context}
                services={services}
                editMode={editMode}
                model={body}
                onEdit={onEdit} />
              {options}
            </div>,
        )}
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
      </div>,
    );
  }
}

export interface ItemControlsProps {
  className?: string;
}

export const ItemControls: React.StatelessComponent<ItemControlProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`input-list-item-controls ${className || ''}`}>
      {children}
    </div>
  );
};

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
