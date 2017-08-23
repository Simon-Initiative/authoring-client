import * as React from 'react';
import * as Immutable from 'immutable';
import * as t from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import guid from '../../../utils/guid';
import { DragHandle } from '../../content/org/drag/DragHandle';
import { DraggableNode } from './DraggableNode';
import { NodeTypes, getExpandId } from './traversal';
import { canHandleDrop } from './utils';
import { Command } from './commands/command';
import { ActionDropdown } from './ActionDropdown';
import { TextInput } from '../../content/common/TextInput';

export interface EditableCaption {
  titleInput: any;
  timer: any;
}

export interface EditableCaptionProps {
  labels: t.Labels;
  model: t.Sequence | t.Unit | t.Module | t.Section;
  depth: number;
  editMode: boolean;
  isHoveredOver: boolean;
  onEdit: (model: t.Sequence | t.Unit | t.Module | t.Section) => void;
  toggleExpanded: (id) => void;
  processCommand: (command: Command) => void;
}

export interface EditableCaptionState {
  isEditing: boolean;
  title: string;
}
 


export class EditableCaption 
  extends React.PureComponent<EditableCaptionProps, EditableCaptionState> {
    
  constructor(props) {
    super(props);

    this.state = { isEditing: false, title: props.model.title };    

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onBeginEdit = this.onBeginEdit.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    
  }

  getLabel(contentType: string) {

    if (contentType === 'Item') {
      return 'Resource';
    }

    return this.props.labels[contentType.toLowerCase()];
  }

  onTitleEdit() {
    const title = this.titleInput.value;
    this.setState(
      { isEditing: false }, 
      () => this.props.onEdit((this.props.model as any).with({ title })));
  }

  onCancel() {
    this.setState({ isEditing: false, title: this.props.model.title });
  }

  onBeginEdit() {
    this.setState({ isEditing: true });
  }

  onTextChange(e) {
    this.setState({ title: e.target.value });
  }


  render() : JSX.Element {

    const { model, depth, editMode } = this.props;
    
    if (this.state.isEditing) {
      return (
        <div style={ { display: 'inline', marginLeft: '40px' } }>
          <input ref={a => this.titleInput = a} type="text" onChange={this.onTextChange} 
            value={this.state.title} style={ { width: '50%' } }/>
          <button 
            key="save"
            onClick={this.onTitleEdit}
            type="button" 
            className="btn btn-sm">
            <i style={ { color: 'green' } } className="icon icon-check"></i>
          </button>
          <button 
            key="cancel"
            onClick={this.onCancel}
            type="button" 
            className="btn btn-sm">
            <i style={ { color: 'red' } } className="icon icon-times"></i>
          </button>
        </div>
      );
    } else {
      const buttons = this.props.isHoveredOver
          ? [<button 
            onClick={this.onBeginEdit}
            type="button" 
            className="btn btn-sm">
            Rename
          </button>, <ActionDropdown labels={this.props.labels} 
            model={model} processCommand={this.props.processCommand}/>]
          : null;
      return (
        <div style={ { display: 'inline' } } 
          >
          <button key="itemClick" onClick={() => this.props.toggleExpanded(getExpandId(model))} 
          type="button" className="btn btn-link">{this.props.children}</button>
          {buttons}
        </div>
      );
    }

    
  }

}

