import * as React from 'react';

import './Remove.scss';

import { RemoveCommand } from './commands/remove';

// tslint:disable-next-line
export const Remove = (props) => {
  return (
    <span className="remove-btn">
      <button
        disabled={!props.editMode}
        onClick={() => props.processCommand(new RemoveCommand())}
        type="button"
        className="btn btn-sm">
        <i className="fa fa-close"></i>
      </button>
    </span>
  );
};
