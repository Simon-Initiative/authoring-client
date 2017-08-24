import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as models from '../../../data/models';
import { AppContext } from '../../common/AppContext';
import { VALID_COMMANDS } from './commands/map';
import { RemoveCommand } from './commands/remove';
import { Command } from './commands/command';
import { NodeTypes } from './traversal';

export interface ActionDropdown {
  
}

export interface ActionDropdownProps {
  org: models.OrganizationModel;
  model: NodeTypes;
  labels: contentTypes.Labels;
  context: AppContext;
  processCommand: (command: Command) => void;
}

export interface ActionDropdownState {
 
}


export function buildMenu(org, model, labels, processCommand, context) {

  return [
    ...VALID_COMMANDS[model.contentType].map(commandClass => new commandClass()), 
    new RemoveCommand(),
  ].map(command => <button className="dropdown-item" key={command.description(labels)}
    disabled={!command.precondition(org, model, context)}
    onClick={() => processCommand(command)}>{command.description(labels)}</button>);
}

export class ActionDropdown 
  extends React.PureComponent<ActionDropdownProps, ActionDropdownState> {
    
  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    return (
      <div className="dropdown" style={ { display: 'inline' } }>
        <button className="btn btn-secondary dropdown-toggle" 
          type="button" id="dropdownMenuButton" data-toggle="dropdown" 
          aria-haspopup="true" aria-expanded="false">
          Edit&nbsp;&nbsp;
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {buildMenu(
            this.props.org, this.props.model, 
            this.props.labels, this.props.processCommand, this.props.context)}
        </div>
      </div>
    );
  }

}

