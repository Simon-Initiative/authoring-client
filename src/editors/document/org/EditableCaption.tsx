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
import { ADD_NEW_COMMANDS, ADD_EXISTING_COMMANDS } from './commands/map';
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


function buildCommandButtons(
  prefix, commands, org, model, 
  labels, processCommand, context) : Object[] {

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

  const buttons = commands[model.contentType].map(commandClass => new commandClass())
    .map(command => <button 
      style={buttonStyle}
      className="btn btn-link btn-sm" key={prefix + command.description(labels)}
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

  renderInsertExisting() {

    if (ADD_EXISTING_COMMANDS[this.props.model.contentType].length > 0) {

      const label : any = {
        fontFamily: 'sans-serif',
        lineHeight: 1.25,
        fontSize: '12',
        position: 'relative',
        marginLeft: '30px',
        top: '-6',
        color: '#606060',
      };

      const buttons = buildCommandButtons(
        'addexisting',
        ADD_EXISTING_COMMANDS,
        this.props.org, this.props.model, this.props.labels,
        this.props.processCommand, this.props.context);
  
      return [
        <span style={label}>Add existing:</span>,
        ...buttons,
      ];
    } else {
      return [];
    }
    
  }

  renderInsertNew() {

    if (ADD_NEW_COMMANDS[this.props.model.contentType].length > 0) {

      const label : any = {
        fontFamily: 'sans-serif',
        lineHeight: 1.25,
        fontSize: '12',
        position: 'relative',
        top: '-6',
        color: '#606060',
      };

      return [
        <span style={label}>Add new:</span>,
        ...buildCommandButtons(
          'addnew',
          ADD_NEW_COMMANDS,
          this.props.org, this.props.model, this.props.labels,
          this.props.processCommand, this.props.context)];

    } else {
      return [];
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

      let buttons = null;

      if (this.props.isHoveredOver) {

        buttons = [];

        buttons.push(<button 
          key="rename"
          onClick={this.onBeginEdit}
          type="button" 
          className="btn btn-sm">
          Rename
        </button>);

        this.renderInsertNew().forEach(e => buttons.push(e));
        this.renderInsertExisting().forEach(e => buttons.push(e));
        
        buttons.push(<Remove editMode={this.props.editMode} 
          processCommand={this.props.processCommand}/>);
      }
      
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

