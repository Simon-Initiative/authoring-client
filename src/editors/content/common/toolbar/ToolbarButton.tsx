import * as React from 'react';

import { Command, CommandProcessor } from '../command';

export type ToolbarButtonProps<DataType> = {
  command: Command<DataType>,
  icon: string,
  tooltip: string,
  processor?: CommandProcessor<DataType>
}

export class ToolbarButton<DataType> extends React.PureComponent<ToolbarButtonProps<DataType>, {}> {
  
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.processor.process(this.props.command);
  }
  
  render() {
    const { command, icon, tooltip } = this.props;
    const iconClasses = 'icon icon-' + icon;
    const style = {
      color: 'white'
    }
    const buttonStyle = {
      backgroundColor: 'black'
    }

    return (
      <button 
        onClick={this.onClick}
        disabled={!this.props.processor.checkPrecondition(this.props.command)} 
        data-toggle='tooltip'
        data-placement='top'
        title={this.props.tooltip}
        type="button" 
        className="btn" 
        style={buttonStyle}>
        <i style={style} className={iconClasses}></i>
      </button>
    );
  }
}

