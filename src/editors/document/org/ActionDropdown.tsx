import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { VALID_COMMANDS } from './commands/map';
import { RemoveCommand } from './commands/remove';
import { Command } from './commands/command';
import { NodeTypes } from './traversal';

export interface ActionDropdown {
  
}

export interface ActionDropdownProps {
  model: NodeTypes;
  processCommand: (command: Command) => void;
}

export interface ActionDropdownState {
 
}


export function buildMenu(model, processCommand) {

  return [
    ...VALID_COMMANDS[model.contentType].map(commandClass => new commandClass()), 
    new RemoveCommand(),
  ].map(command => <a className="dropdown-item" 
    onClick={() => processCommand(command)}>{command.description()}</a>);
}

export class ActionDropdown 
  extends React.PureComponent<ActionDropdownProps, ActionDropdownState> {
    
  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    return (
      <div className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" 
          type="button" id="dropdownMenuButton" data-toggle="dropdown" 
          aria-haspopup="true" aria-expanded="false">
          Edit&nbsp;&nbsp;
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {buildMenu(this.props.model, this.props.processCommand)}
        </div>
      </div>
    );
  }

}

