import * as React from 'react';
import { Map, List } from 'immutable';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { Actions } from 'editors/document/org/Actions.controller';
import { Details } from 'editors/document/org/Details';
import { LabelsEditor } from 'editors/content/org/LabelsEditor';
import { duplicateOrganization } from 'actions/models';
import * as Messages from 'types/messages';
import * as org from 'data/models/utils/org';
import { Maybe } from 'tsmonad';
import { OrgComponentEditor } from './OrgComponentEditor';
import guid from 'utils/guid';
import './OrgDetailsEditor.scss';
import { containsUnitsOnly } from './utils';
import { ModalMessage } from 'utils/ModalMessage';
import { TabContainer, Tab } from 'components/common/TabContainer';

function buildMoreInfoAction(display, dismiss) {
  const moreInfoText = 'Organizations that do not contain any modules will not display relevant'
    + ' information in the OLI Learning Dashboard.  Therefore it is recommended that a one-level'
    + ' organization use modules instead of units to organize course material.';


  const moreInfoAction = {
    label: 'More Info',
    enabled: true,
    execute: (message: Messages.Message, dispatch) => {
      display(
        <ModalMessage onCancel={dismiss}>{moreInfoText}</ModalMessage>);
    },
  };
  return moreInfoAction;
}

function buildUnitsMessage(display, dismiss) {
  const content = new Messages.TitledContent().with({
    title: 'No modules.',
    message: 'Organizations without modules have learning dashboard limitations in OLI',
  });

  return new Messages.Message().with({
    content,
    guid: 'UnitsOnly',
    scope: Messages.Scope.Organization,
    severity: Messages.Severity.Warning,
    canUserDismiss: false,
    actions: List([buildMoreInfoAction(display, dismiss)]),
  });

}

export interface OrgDetailsEditorProps {
  skills: Map<string, contentTypes.Skill>;
  objectives: Map<string, contentTypes.LearningObjective>;
  placements: org.Placements;
  model: Maybe<models.OrganizationModel>;
  onEdit: (request: org.OrgChangeRequest) => void;
  editMode: boolean;
  dispatch: any;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  course: models.CourseModel;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const enum TABS {
  Content = 0,
  Details = 1,
  Labels = 2,
  Actions = 3,
}

export interface OrgDetailsEditorState {
  currentTab: TABS;
}

/**
 * OrgDetailsEditor React Component
 */
export class OrgDetailsEditor
  extends React.PureComponent<OrgDetailsEditorProps, OrgDetailsEditorState> {
  unitsMessageDisplayed: boolean = false;

  constructor(props) {
    super(props);

    this.onNodeEdit = this.onNodeEdit.bind(this);
    this.onAddSequence = this.onAddSequence.bind(this);

    this.state = {
      currentTab: TABS.Details,
    };
  }

  componentDidMount() {
    this.updateUnitsMessage(this.props);
  }

  componentWillReceiveProps(nextProps: Readonly<OrgDetailsEditorProps>) {
    if (this.props.model !== nextProps.model) {
      this.updateUnitsMessage(nextProps);
    }
  }

  updateUnitsMessage(props: OrgDetailsEditorProps) {
    const { model } = this.props;

    model.lift((model) => {
      const containsOnly = containsUnitsOnly(model);

      if (!containsOnly) {
        this.unitsMessageDisplayed = false;
        props.dismissMessage(buildUnitsMessage(props.displayModal, props.dismissModal));

      } else if (!this.unitsMessageDisplayed && containsOnly) {
        this.unitsMessageDisplayed = true;
        props.showMessage(buildUnitsMessage(props.displayModal, props.dismissModal));
      }
    });
  }

  onNodeEdit(request: org.OrgChangeRequest) {
    this.props.onEdit(request);
  }

  renderDetails(model: models.OrganizationModel) {
    return (
      <div className="org-tab">
        <Details
          editMode={this.props.editMode}
          model={model}
          onEdit={this.props.onEdit}
        />
      </div>
    );
  }

  renderLabels(model: models.OrganizationModel) {
    return (
      <div className="org-tab">
        <LabelsEditor
          onEdit={this.props.onEdit}
          editMode={this.props.editMode}
          model={model} />
      </div>
    );
  }

  onAddSequence() {

    const id = guid();

    const mapper = (model) => {
      const s: contentTypes.Sequence = new contentTypes.Sequence()
        .with({ id, title: 'New ' + model.labels.sequence });
      const sequences = model.sequences
        .with({ children: model.sequences.children.set(s.guid, s) });

      return model.with({ sequences });
    };

    const undo = (model: models.OrganizationModel) => {
      const children = model.sequences.children.filter(
        c => (c as any).id === id).toOrderedMap();
      const sequences = model.sequences.with({ children });
      return model.with({ sequences });
    };

    this.props.onEdit(org.makeUpdateRootModel(mapper, undo));
  }

  onTabClick(index: number) {
    this.setState({ currentTab: index });
  }

  renderTabs(model: models.OrganizationModel) {
    return (
      <TabContainer labels={['Content', 'Details', 'Labels', 'Actions']}>
        <Tab>
          {this.renderContent(model)}
        </Tab>
        <Tab>
          {this.renderDetails(model)}
        </Tab>
        <Tab>
          {this.renderLabels(model)}
        </Tab>
        <Tab>
          {this.renderActions(model)}
        </Tab>
      </TabContainer>
    );
  }

  renderActions(model: models.OrganizationModel) {
    const { dispatch, course } = this.props;

    const dupe = () => dispatch(
      duplicateOrganization(
        course.guid,
        model, course));

    return (
      <Actions
        onDuplicate={dupe}
        org={model}
        course={this.props.course}
      />);
  }

  renderContent(model: models.OrganizationModel) {
    return (
      <OrgComponentEditor
        {...this.props}
        onDispatch={this.props.dispatch}
        org={Maybe.just(model)}
        componentId={''}
      />
    );
  }

  render() {

    return this.props.model.caseOf({
      just: (m) => {
        return (
          <div className="org-details-editor">
            <div className="doc-head">

              <h3>Organization: {m.title}</h3>

              {this.renderTabs(m)}
            </div>
          </div>);
      },
      nothing: () => null,
    });


  }

}
