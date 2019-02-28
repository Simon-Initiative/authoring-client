import * as React from 'react';
import { Map } from 'immutable';
import * as t from '../../../data/contentTypes';
import * as models from '../../../data/models';
import * as org from 'data/models/utils/org';
import { Title, Size } from 'components/objectives/Title';
import * as Messages from 'types/messages';
import { Maybe } from 'tsmonad';
import { map } from 'data/utils/map';
import * as commands from './commands/map';
import { Command } from './commands/command';
import './OrgComponent.scss';

export interface OrgComponentEditorProps {
  skills: Map<string, t.Skill>;
  objectives: Map<string, t.LearningObjective>;
  course: models.CourseModel;
  org: Maybe<models.OrganizationModel>;
  componentId: string;
  editMode: boolean;
  onEdit: (change: org.OrgChangeRequest) => any;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  onDispatch: (c) => void;
}

export interface OrgComponentEditorState {
  model: Maybe<t.Sequence | t.Unit | t.Module | t.Section>;
}

function buildCommandButtons(
  prefix, commands, org, model,
  labels, processCommand, editMode): Object[] {

  const slash: any = {
    fontFamily: 'sans-serif',
    position: 'relative',
    color: '#606060',
  };

  const buttons = commands[model.contentType].map(commandClass => new commandClass())
    .map(command => [<button
      className="btn btn-link btn-sm" key={prefix + command.description(labels)}
      disabled={!command.precondition(org, model) || !editMode}
      onClick={() => processCommand(command)}>{command.description(labels)}</button>,
    <span key={prefix + command.description(labels) + 'slash'} style={slash}>/</span>])
    .reduce((p, c) => p.concat(c), []);

  buttons.pop();

  return buttons;
}

export class OrgComponentEditor
  extends React.PureComponent<OrgComponentEditorProps, OrgComponentEditorState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);

    this.state = { model: Maybe.nothing() };
  }

  componentDidMount() {
    this.findComponentModel(this.props);
  }

  componentWillReceiveProps(nextProps: OrgComponentEditorProps) {
    this.findComponentModel(nextProps);
  }

  findComponentModel(props: OrgComponentEditorProps) {
    props.org.caseOf({
      just: (org) => {
        // Find the component
        map(
          (e) => {
            if (e.id === props.componentId) {
              this.setState({ model: Maybe.just(e as any) });
            }
            return e;
          },
          org.sequences as any,
        );
      },
      nothing: () => {
        // Do nothing
      },
    });
  }

  onTitleEdit(model, title) {
    this.props.onEdit(org.makeUpdateNode(model.id, n => (n as any).with({ title })));
  }

  getLabel(model: t.Sequence | t.Unit | t.Module | t.Section) {
    return this.props.org.caseOf({
      just: (o) => {
        if (model.contentType === 'Sequence') {
          return o.labels.sequence;
        }
        if (model.contentType === 'Unit') {
          return o.labels.unit;
        }
        if (model.contentType === 'Module') {
          return o.labels.module;
        }
        if (model.contentType === 'Section') {
          return o.labels.section;
        }
      },
      nothing: () => '',
    });
  }

  renderContent(
    model: t.Sequence | t.Unit | t.Module | t.Section): JSX.Element {

    const { editMode } = this.props;

    return (
      <div className="org-component-editor">
        <Title
          title={model.title}
          editMode={editMode}
          onBeginExternallEdit={() => true}
          requiresExternalEdit={false}
          isHoveredOver={true}
          onEdit={this.onTitleEdit.bind(this, model)}
          loading={false}
          disableRemoval={true}
          editWording="Edit"
          onRemove={() => false}
          size={Size.Large}
        >
          <span style={{ fontSize: '25pt' }}>{this.getLabel(model) + ': ' + model.title}</span>
        </Title>
        {this.renderActionBar(model)}
      </div>
    );

  }

  renderInsertExisting(org, model, processor) {
    if (commands.ADD_EXISTING_COMMANDS[model.contentType].length > 0) {
      const buttons = buildCommandButtons(
        'addexisting',
        commands.ADD_EXISTING_COMMANDS,
        org, model, org.labels,
        processor, this.props.editMode);

      return [
        <span key="add-existing" className="label">Add existing:</span>,
        ...buttons,
      ];
    }

    return [];
  }

  renderInsertNew(org, model, processor) {

    if (commands.ADD_NEW_COMMANDS[model.contentType].length > 0) {
      return [
        <span key="add-new" className="label">Add new:</span>,
        ...buildCommandButtons(
          'addnew',
          commands.ADD_NEW_COMMANDS,
          org, model, org.labels,
          processor, this.props.editMode)];

    }

    return [];
  }

  renderActionBar(model: t.Sequence | t.Unit | t.Module | t.Section) {
    return this.props.org.caseOf({
      just: (org) => {
        const processor = this.processCommand.bind(this, org, model);
        return (
          <div>
            {[
              ...this.renderInsertNew(org, model, processor),
              ...this.renderInsertExisting(org, model, processor)]}
          </div>
        );
      },
      nothing: () => null,
    });
  }

  renderWaiting() {
    return null;
  }

  processCommand(org, model, command: Command) {
    command.execute(
      org, model, this.props.course,
      this.props.displayModal, this.props.dismissModal, this.props.onDispatch)
      .then((cr) => {
        this.props.onEdit(cr);
      });
  }


  render(): JSX.Element {
    const { model } = this.state;
    return model.caseOf({
      just: m => this.renderContent(m),
      nothing: () => this.renderWaiting(),
    });
  }

}
