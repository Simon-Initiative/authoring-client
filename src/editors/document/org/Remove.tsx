import * as React from 'react';

import { RemoveCommand } from './commands/remove';

// tslint:disable-next-line
export const Remove = (props) => {
  return (
    <span style={ { float: 'right', paddingTop: '4px' } }>
      <button 
        disabled={!props.editMode} 
        onClick={() => props.processCommand(new RemoveCommand())} 
        type="button" 
        className="btn btn-sm btn-outline-secondary">
        <i className="icon icon-remove"></i>
      </button>
    </span>
  );
};
