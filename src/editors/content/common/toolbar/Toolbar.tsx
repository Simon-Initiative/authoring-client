import * as React from 'react';
import { Command, CommandProcessor } from '../command';

export interface ToolbarProps<DataType> {
  commandProcessor?: CommandProcessor<DataType>;
  dismissToolbar?: () => void;  
}

export interface Toolbar<DataType> {
  component: any;
}

export class Toolbar<DataType> extends React.PureComponent<ToolbarProps<DataType>, {}>
  implements CommandProcessor<DataType> {

  constructor(props) {
    super(props);

    this.onBlur = this.onBlur.bind(this);
  }

  onBlur() {
    this.props.dismissToolbar();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false; 
  }

  componentDidMount() {
    this.component.focus();
  }

  renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child as any, { processor: this });
    });
  }

  process(command: Command<DataType>) {
    // Delegate processing and dismiss the toolbar
    this.props.commandProcessor.process(command);
    this.props.dismissToolbar();
  }

  checkPrecondition(command: Command<DataType>) {
    return this.props.commandProcessor.checkPrecondition(command);
  }

  render() {
    const style = {
      boxShadow: '5px 5px 5px #888888',
      backgroundColor: 'black',
    };
    return (
      <div style={style} ref={c => this.component = c} 
        onBlur={this.onBlur} className="btn-toolbar" 
        role="toolbar" aria-label="Toolbar with button groups">
        <div className="btn-group btn-group-sm" role="group" aria-label="First group">
          {this.renderChildren()}
        </div>
      </div>);
  }

}
