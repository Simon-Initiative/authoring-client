import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import * as models from '../../../data/models';
import { AppContext } from '../../common/AppContext';
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
          
        </div>
      </div>
    );
  }

}

