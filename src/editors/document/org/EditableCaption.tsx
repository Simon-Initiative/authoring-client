import * as React from 'react';
import * as Immutable from 'immutable';
import * as t from '../../../data/contentTypes';
import * as models from '../../../data/models';
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
  org: models.OrganizationModel;
  context: AppContext;
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
 
const ESCAPE_KEYCODE = 27;
const ENTER_KEYCODE = 13;

export class EditableCaption 
  extends React.PureComponent<EditableCaptionProps, EditableCaptionState> {
    
  constructor(props) {
    super(props);

    this.state = { isEditing: false, title: props.model.title };    

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onBeginEdit = this.onBeginEdit.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
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

  onKeyUp(e) {
    if (e.keyCode === ESCAPE_KEYCODE) {
      this.onCancel();
    } else if (e.keyCode === ENTER_KEYCODE) {
      this.onTitleEdit();
    }
  }


  render() : JSX.Element {

    const { model, depth, editMode } = this.props;
    
    if (this.state.isEditing) {
      return (
        <div style={ { display: 'inline', marginLeft: '40px' } }>
          <input ref={a => this.titleInput = a} type="text" onKeyUp={this.onKeyUp}
            onChange={this.onTextChange} 
            value={this.state.title} style={ { width: '50%', paddingTop: '7px' } }/>
          <button 
            key="save"
            onClick={this.onTitleEdit}
            type="button" 
            className="btn btn-sm">
            Done
          </button>
          <button 
            key="cancel"
            onClick={this.onCancel}
            type="button" 
            className="btn btn-sm">
            Cancel
          </button>
        </div>
      );
    } else {
      const buttons = this.props.isHoveredOver
          ? [<button 
            key="rename"
            onClick={this.onBeginEdit}
            type="button" 
            className="btn btn-sm">
            Rename
          </button>, <ActionDropdown key="actions" labels={this.props.labels} 
            org={this.props.org} context={this.props.context}
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

