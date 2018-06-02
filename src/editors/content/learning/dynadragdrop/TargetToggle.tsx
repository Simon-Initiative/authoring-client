import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames } from 'styles/jss';

import { styles } from './TargetToggle.styles';

export interface TargetToggleProps {
  id: string;
  className?: string;
  onToggleType: (id: string) => void;
}

/**
 * TargetToggle React Stateless Component
 */
export const TargetToggle: React.StatelessComponent<StyledComponentProps<TargetToggleProps>>
  = injectSheetSFC<TargetToggleProps>(styles)(({
  className, classes, id, onToggleType,
}) => {
    return (
      <div className={classNames(['TargetToggle', classes.targetToggle, className])}
          onClick={() => onToggleType(id)}>
            <i className="fa fa-crosshairs" />
      </div>
    );
  });
