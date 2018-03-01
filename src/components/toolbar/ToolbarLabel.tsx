import * as React from 'react';
import { injectSheet, JSSProps } from 'styles/jss';
import { styles } from './ToolbarLabel.style';

export interface ToolbarLabelProps {

}

export interface ToolbarLabelState {}

@injectSheet(styles)
export class ToolbarLabel extends React.Component<ToolbarLabelProps & JSSProps, ToolbarLabelState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.toolbarLabel}>{this.props.children}</div>
    );
  }
}
