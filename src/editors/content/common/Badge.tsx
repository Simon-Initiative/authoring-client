import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';

import { styles } from './Badge.styles';

export interface BadgeProps {
  color?: string;
  textColor?: string;
}

/**
 * Badge React Stateless Component
 */
const Badge:
React.StatelessComponent<StyledComponentProps<BadgeProps, typeof styles>> = ({
  className, classes, children, color, textColor,
}) => {
  return (
    <span
      className={classNames(['Badge', classes.Badge, className])}
      style={{ backgroundColor: color, color: textColor }}>
      {children}
    </span>
  );
};

const StyledBadge = withStyles<BadgeProps>(styles)(Badge);
export { StyledBadge as Badge };
