import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { DragTypes } from 'utils/drag';
import {
  InputList, InputListItem,
} from 'editors/content/common/InputList';
import { classNames } from 'styles/jss';

import './OrderingChoice.scss';

export const OrderingChoiceList = InputList;

export interface OrderingChoiceProps  {
  className?: string;
  index: number;
  label: string;
  choice: contentTypes.Choice;
  context: AppContext;
  services: AppServices;
  onReorderChoice: (originalIndex: number, newIndex: number) => void;
  onUpdateHover: (hover: string) => void;
}

export interface OrderingChoiceState {

}

/**
 * React component Choice
 */
export class OrderingChoice extends React.PureComponent<OrderingChoiceProps, OrderingChoiceState> {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, choice, context, label, index, services, onReorderChoice,
    } = this.props;

    return (
      <InputListItem
        className={classNames(['choice', className])}
        id={choice.guid}
        activeContentGuid=""
        hover=""
        onUpdateHover={this.props.onUpdateHover}
        onFocus={() => {}}
        context={context}
        services={services}
        editMode={false}
        index={index}
        label={label}
        isDraggable
        alwaysAllowDragging
        onDragDrop={onReorderChoice}
        dragType={DragTypes.OrderingChoice}
        body={choice.body}
        onEdit={() => {}} />
    );
  }
}
