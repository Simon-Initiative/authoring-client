import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import { Tooltip } from 'utils/tooltip';

import { styles } from './TargetToggle.styles';

const DELETE_TOOLTIP_MSG = 'Drag and drop questions must contain at least one target. '
  + 'Please add another target before removing this one.';

export interface TargetToggleProps {
  id: string;
  canToggle: boolean;
  onToggleType: (id: string) => void;
}

/**
 * TargetToggle React Stateless Component
 */
const TargetToggle:
React.StatelessComponent<StyledComponentProps<TargetToggleProps, typeof styles>> = ({
  className, classes, id, onToggleType, canToggle,
}) => {
  return (
    <div className={classNames(['TargetToggle', classes.targetToggle,
      className, !canToggle && classes.disabled])}
        onClick={() => canToggle && onToggleType(id)}>
        {canToggle
          ? (
            <i className="fa fa-crosshairs" />
          )
          : (
            <Tooltip title={DELETE_TOOLTIP_MSG}>
              <i className="fa fa-crosshairs" />
            </Tooltip>
          )
        }
    </div>
  );
};

const StyledTargetToggle = withStyles<TargetToggleProps>(styles)(TargetToggle);
export { StyledTargetToggle as TargetToggle };
