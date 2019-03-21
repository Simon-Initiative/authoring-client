import * as React from 'react';
import { DropTarget } from 'react-dnd';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import { DragTypes } from 'utils/drag';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { TargetToggle } from 'editors/content/learning/dynadragdrop/TargetToggle';

import { styles } from 'editors/content/learning/dynadragdrop/DynaDropTarget.styles';
import { Initiator } from 'editors/content/learning/dynadragdrop/Initiator';

export interface DynaDropTargetProps {
  id: string;
  inputVal: string;
  selectedInitiator: string;
  label: string;
  isHeader?: boolean;
  initiators: InitiatorModel[];
  editMode: boolean;
  connectDropTarget?: any;
  canToggleType: boolean;
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
    const { inputVal, onDrop } = props;
    onDrop(monitor.getItem().initiator, inputVal, monitor.getItem().originalTargetId);
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
class DynaDropTarget
    extends React.PureComponent<StyledComponentProps<DynaDropTargetProps, typeof styles>,
    DynaDropTargetState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { className, classes, id, inputVal, connectDropTarget, isHeader,
      isHovered, label, initiators, editMode, onRemoveInitiator, selectedInitiator,
      canToggleType, onToggleType } = this.props;

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
                targetId={inputVal}
                model={initiator} editMode={editMode}
                selected={initiator.inputVal === selectedInitiator}
                onRemove={guid => onRemoveInitiator(guid, inputVal)} />
            ))}
          </div>
        </div>

        <TargetToggle id={id} onToggleType={onToggleType} canToggle={canToggleType} />
      </TCell>
    ));
  }
}

const StyledDynaDropTarget = withStyles<DynaDropTargetProps>(styles)(DynaDropTarget);
export { StyledDynaDropTarget as DynaDropTarget };
