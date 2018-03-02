import * as React from 'react';
import { injectSheet, JSSProps } from 'styles/jss';

import styles from './ToolbarSeparator.style';

export interface ToolbarSeparatorProps {

}

export interface ToolbarSeparatorState {}

@injectSheet(styles)
export class ToolbarSeparator
  extends React.Component<ToolbarSeparatorProps & JSSProps, ToolbarSeparatorState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.toolbarSeparator} />
    );
  }
}
