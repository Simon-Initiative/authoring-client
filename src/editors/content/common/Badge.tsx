import * as React from 'react';
import { Part } from 'data/contentTypes';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames } from 'styles/jss';

import { styles } from './Badge.styles';

export interface BadgeProps {
  color?: string;
}

/**
 * Badge React Stateless Component
 */
export const Badge: React.StatelessComponent<StyledComponentProps<BadgeProps>>
  = injectSheetSFC<BadgeProps>(styles)(({
  className, classes, children, color,
}) => {
    return (
      <span
        className={classNames(['Badge', classes.Badge, className])}
        style={{ backgroundColor: color }}>
        {children}
      </span>
    );
  });
