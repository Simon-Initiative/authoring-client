import * as React from 'react';
import { DropTarget } from 'react-dnd';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { DragTypes } from 'utils/drag';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';

import { styles } from './DynaDropTarget.styles';
import { Initiator } from 'editors/content/learning/dynadragdrop/Initiator';

export interface DynaDropTargetProps {
  id: string;
  label: string;
  initiators: InitiatorModel[];
  editMode: boolean;
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
    const { className, classes, id,  header, connectDropTarget,
      isHovered, label, initiators, editMode } = this.props;

    const TCell = header ? 'th' : 'td';

    return connectDropTarget((
      <TCell className={classNames([
        classes.dynaDropTarget, isHovered && classes.targetHover, className])}>
        <div className={classes.label}>
          {label}
        </div>
        <div className={classes.initiators}>
          {initiators && initiators.map(initiator => (
            <Initiator
              model={initiator} editMode={editMode} onRemove={() => {}} />
          ))}
        </div>
      </TCell>
    ));
  }
}
