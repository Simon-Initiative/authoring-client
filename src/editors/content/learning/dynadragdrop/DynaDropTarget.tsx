import * as React from 'react';
import { DropTarget } from 'react-dnd';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { DragTypes } from 'utils/drag';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';
import { TargetToggle } from './TargetToggle';

import { styles } from './DynaDropTarget.styles';
import { Initiator } from 'editors/content/learning/dynadragdrop/Initiator';

export interface DynaDropTargetProps {
  id: string;
  assessmentId: string;
  selectedInitiator: string;
  label: string;
  isHeader?: boolean;
  initiators: InitiatorModel[];
  editMode: boolean;
  connectDropTarget?: any;
  isHovered?: boolean;
  onDrop: (
    initiatorId: string, targetAssessmentId: string, originalTargetAssessmentId: string) => void;
  onRemoveInitiator: (initiatorId: string, targetAssessmentId: string) => void;
  onToggleType: (id: string) => void;
}

export interface DynaDropTargetState {

}

const target = {
  drop(props, monitor) {
    const { assessmentId, onDrop } = props;
    onDrop(monitor.getItem().initiator, assessmentId, monitor.getItem().originalTargetId);
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
    const { className, classes, id, assessmentId, connectDropTarget, isHeader,
      isHovered, label, initiators, editMode, onRemoveInitiator, selectedInitiator,
      onToggleType } = this.props;

    const TCell = isHeader ? 'th' : 'td';

    return connectDropTarget((
      <TCell className={classNames([classes.dynaDropTarget,
        className])}>
        <div className={classNames([classes.targetHover, isHovered && classes.targetHovered])}>
          <div className={classes.label}>
            {label}
          </div>
          <div className={classNames([classes.initiators])}>
            {initiators && initiators.map(initiator => (
              <Initiator
                key={initiator.guid}
                targetId={assessmentId}
                model={initiator} editMode={editMode}
                selected={initiator.assessmentId === selectedInitiator}
                onRemove={guid => onRemoveInitiator(guid, assessmentId)} />
            ))}
          </div>
        </div>

        <TargetToggle id={id} onToggleType={onToggleType} />
      </TCell>
    ));
  }
}
