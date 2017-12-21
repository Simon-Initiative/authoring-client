import * as React from 'react';
import * as t from '../../../data/contentTypes';
import * as models from '../../../data/models';
import { AppContext } from '../../common/AppContext';
import { getExpandId } from './traversal';
import { Command } from './commands/command';
import { Remove } from './Remove';
import { ADD_EXISTING_COMMANDS, ADD_NEW_COMMANDS } from './commands/map';

import './EditableCaption.scss';

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
  labels, processCommand, context, editMode) : Object[] {

  const slash : any = {
    fontFamily: 'sans-serif',
    position: 'relative',
    color: '#606060',
  };

  const buttons = commands[model.contentType].map(commandClass => new commandClass())
    .map(command => [<button
      className="btn btn-link btn-sm" key={prefix + command.description(labels)}
      disabled={!command.precondition(org, model, context) || !editMode}
      onClick={() => processCommand(command)}>{command.description(labels)}</button>,
      <span key={prefix + command.description(labels) + 'slash'} style={slash}>/</span>])
    .reduce((p, c) => p.concat(c), []);

  buttons.pop();

  return buttons;
}

export class EditableCaption
  extends React.PureComponent<EditableCaptionProps, EditableCaptionState> {
  titleInput: any;
  timer: any;

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
      const buttons = buildCommandButtons(
        'addexisting',
        ADD_EXISTING_COMMANDS,
        this.props.org, this.props.model, this.props.labels,
        this.props.processCommand, this.props.context, this.props.editMode);

      return [
        <span key="add-existing" className="label">Add existing:</span>,
        ...buttons,
      ];
    }

    return [];
  }

  renderInsertNew() {

    if (ADD_NEW_COMMANDS[this.props.model.contentType].length > 0) {
      return [
        <span key="add-new" className="label">Add new:</span>,
        ...buildCommandButtons(
          'addnew',
          ADD_NEW_COMMANDS,
          this.props.org, this.props.model, this.props.labels,
          this.props.processCommand, this.props.context, this.props.editMode)];

    }

    return [];
  }


  render() : JSX.Element {

    const { model } = this.props;

    if (this.state.isEditing) {
      return (
        <div className="form-inline" style={{ marginLeft: 30 }}>
          <div className="form-group">
            <input
              type="text"
              ref={a => this.titleInput = a}
              onKeyUp={this.onKeyUp}
              className="form-control input-sm"
              onChange={this.onTextChange}
              value={this.state.title} />
            <button
              key="save"
              onClick={this.onTitleEdit}
              type="button"
              className="btn btn-link btn-sm">
              Done
            </button>
            <button
              key="cancel"
              onClick={this.onCancel}
              type="button"
              className="btn btn-link btn-sm">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    let buttons = null;

    if (this.props.isHoveredOver) {

      buttons = [];

      buttons.push(
        <button
          key="rename"
          onClick={this.onBeginEdit}
          disabled={!this.props.editMode}
          type="button"
          className="btn btn-link btn-sm">
          Rename
        </button>,
      );

      this.renderInsertNew().forEach(e => buttons.push(e));
      this.renderInsertExisting().forEach(e => buttons.push(e));

      buttons.push(<span className="flex-spacer"/>);

      buttons.push(<Remove key="remove" editMode={this.props.editMode}
        processCommand={this.props.processCommand}/>);
    }

    return (
      <div className="editable-caption">
        <button
          className="caption-btn btn btn-link"
          onClick={() => this.props.toggleExpanded(getExpandId(model))}>
          {this.props.children}
        </button>

        {buttons}
      </div>
    );
  }

}

