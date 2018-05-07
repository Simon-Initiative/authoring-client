import * as React from 'react';
import { DropTarget } from 'react-dnd';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { DragTypes } from 'utils/drag';

import { styles } from './DynaDropTarget.styles';

export interface DynaDropTargetProps {
  header?: boolean;
  connectDropTarget?: any;
  isHovered?: boolean;
}

export interface DynaDropTargetState {

}

const target = {
  drop(props, monitor) {
    console.log('NOT IMPLEMENTED');
  },
  canDrop(props, monitor) {
    return true;
  },
};

/**
 * DynaDropTarget React Component
 */
@DropTarget(
({ dragType }) => dragType || DragTypes.DynaDropInitiator, target, (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isHovered: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
})
@injectSheet(styles)
export class DynaDropTarget
    extends React.PureComponent<StyledComponentProps<DynaDropTargetProps>,
    DynaDropTargetState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { className, classes, header, connectDropTarget, isHovered } = this.props;

    return connectDropTarget((
      header
      ? (
        <th className={classNames([
          classes.dynaDropTarget, isHovered && classes.targetHover, className])} />
        )
      :(
        <td className={classNames([
          classes.dynaDropTarget, isHovered && classes.targetHover, className])} />
      )
    ));
  }
}
