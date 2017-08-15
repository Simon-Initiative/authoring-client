import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Command } from './commands/command';
import { NodeTypes } from './traversal';
import { ActionDropdown } from './ActionDropdown';

export interface Row {
  
}

export interface RowProps {
  labels: contentTypes.Labels;
  model: NodeTypes;
  index: number;
  processCommand: (command: Command) => void;
  isExpanded: boolean;
}

export interface RowState {
  
}


export class Row 
  extends React.PureComponent<RowProps, RowState> {
    
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.model !== nextProps.model) {
      return true;
    }
    if (this.props.index !== nextProps.index) {
      return true;
    }
    if (this.props.isExpanded !== nextProps.isExpanded) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {

    const { model, index, children, processCommand, labels } = this.props;

    return null;
  }

}

