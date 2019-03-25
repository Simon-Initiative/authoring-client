import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';

import { styles } from './Badge.styles';

export interface BadgeProps {
  color?: string;
}

/**
 * Badge React Stateless Component
 */
const Badge:
React.StatelessComponent<StyledComponentProps<BadgeProps, typeof styles>> = ({
  className, classes, children, color,
}) => {
  return (
    <span
      className={classNames(['Badge', classes.Badge, className])}
      style={{ backgroundColor: color }}>
      {children}
    </span>
  );
};

const StyledBadge = withStyles<BadgeProps>(styles)(Badge);
export { StyledBadge as Badge };
