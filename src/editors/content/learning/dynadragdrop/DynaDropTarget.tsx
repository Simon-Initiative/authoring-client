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
  assessmentId: string;
  label: string;
  initiators: InitiatorModel[];
  editMode: boolean;
  header?: boolean;
  connectDropTarget?: any;
  isHovered?: boolean;
  onDrop: (initiatorId: string, targetAssessmentId: string) => void;
  onRemoveInitiator: (initiatorId: string, targetAssessmentId: string) => void;
}

export interface DynaDropTargetState {

}

const target = {
  drop(props, monitor) {
    const { assessmentId, onDrop } = props;
    onDrop(monitor.getItem().index, assessmentId);
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
    const { className, classes, id, assessmentId,  header, connectDropTarget,
      isHovered, label, initiators, editMode, onRemoveInitiator } = this.props;

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
              model={initiator} editMode={editMode}
              onRemove={guid => onRemoveInitiator(guid, assessmentId)} />
          ))}
        </div>
      </TCell>
    ));
  }
}
