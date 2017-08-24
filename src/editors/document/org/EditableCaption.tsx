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
import { Remove } from './Remove';
import { VALID_COMMANDS } from './commands/map';
import { RemoveCommand } from './commands/remove';

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


function buildCommandButtons(org, model, labels, processCommand, context) : Object[] {

  const slash : any = {
    fontFamily: 'sans-serif',
    lineHeight: 1.25,
    position: 'relative',
    top: '-4',
    color: '#606060',
  };
  const buttonStyle : any = {
    padding: '0 5 0 5',
  };

  const buttons = VALID_COMMANDS[model.contentType].map(commandClass => new commandClass())
    .map(command => <button 
      style={buttonStyle}
      className="btn btn-link btn-sm" key={command.description(labels)}
      disabled={!command.precondition(org, model, context)}
      onClick={() => processCommand(command)}>{command.description(labels)}</button>)
    .map(button => [button, <span style={slash}>/</span>])
    .reduce((p, c) => p.concat(c), []);
  
  buttons.pop();

  return buttons;
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
            value={this.state.title} style={ { width: '50%', paddingTop: '2px' } }/>
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
      const linkStyle : any = {
        color: 'black',
        fontWeight: 'normal',
      };
      const label : any = {
        fontFamily: 'sans-serif',
        lineHeight: 1.25,
        fontSize: '12',
        position: 'relative',
        top: '-6',
        color: '#606060',
      };
      const buttons = this.props.isHoveredOver
          ? [<button 
              key="rename"
              onClick={this.onBeginEdit}
              type="button" 
              className="btn btn-sm">
              Rename
            </button>, 

            <span style={label}>Insert:</span>,

            ...buildCommandButtons(
              this.props.org, this.props.model, this.props.labels,
              this.props.processCommand, this.props.context),

            <Remove editMode={this.props.editMode} processCommand={this.props.processCommand}/>]
          : null;
      return (
        <div style={ { display: 'inline' } } 
          >
          <button key="itemClick" onClick={() => this.props.toggleExpanded(getExpandId(model))} 
          type="button" style={linkStyle} className="btn btn-link">{this.props.children}</button>
          {buttons}
        </div>
      );
    }

    
  }

}

