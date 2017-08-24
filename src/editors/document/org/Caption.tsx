import * as React from 'react';
import * as Immutable from 'immutable';
import * as t from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import * as models from '../../../data/models';
import guid from '../../../utils/guid';
import { DragHandle } from '../../content/org/drag/DragHandle';
import { DraggableNode } from './DraggableNode';
import { NodeTypes, getExpandId } from './traversal';
import { canHandleDrop } from './utils';
import { Command } from './commands/command';
import { ActionDropdown } from './ActionDropdown';
import { TextInput } from '../../content/common/TextInput';

export interface Caption {
  titleInput: any;
  timer: any;
}

export interface CaptionProps {
  labels: t.Labels;
  model: t.Item;
  org: models.OrganizationModel;
  context: AppContext;
  depth: number;
  editMode: boolean;
  isHoveredOver: boolean;
  onEdit: (model: t.Sequence | t.Unit | t.Module | t.Section) => void;
  toggleExpanded: (id) => void;
  processCommand: (command: Command) => void;
  onViewEdit: () => void;
}

export interface CaptionState {
  mouseOver: boolean;
  
}
 


export class Caption 
  extends React.PureComponent<CaptionProps, CaptionState> {
    
  constructor(props) {
    super(props);

    this.state = { mouseOver: false };    

    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onViewEdit = this.onViewEdit.bind(this);
  }

  getLabel(contentType: string) {

    if (contentType === 'Item') {
      return 'Resource';
    }

    return this.props.labels[contentType.toLowerCase()];
  }


  onEnter() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.setState({ mouseOver: true }), 250);
    
  }

  onViewEdit() {
    this.props.onViewEdit();
  }

  onLeave() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setState({ mouseOver: false });
  }

  render() : JSX.Element {

    const { model, depth, editMode } = this.props;
    
    
    const buttons = this.state.mouseOver 
        ? [<button 
          onClick={this.onViewEdit}
          type="button" 
          className="btn btn-sm">
          View
        </button>, <ActionDropdown labels={this.props.labels} 
          org={this.props.org} context={this.props.context}
          model={model} processCommand={this.props.processCommand}/>]
        : null;
    return (
      <div style={ { display: 'inline' } } 
        onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
        <button onClick={() => this.props.toggleExpanded(getExpandId(model))} 
        type="button" className="btn btn-link">{this.props.children}</button>
        {buttons}
      </div>
    );
    
  }

}

