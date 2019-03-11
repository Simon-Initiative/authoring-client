import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { Map } from 'immutable';
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

export interface OrgDetailsEditorProps {
  skills: Map<string, contentTypes.Skill>;
  objectives: Map<string, contentTypes.LearningObjective>;
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
  extends React.PureComponent<StyledComponentProps<OrgDetailsEditorProps>,
  OrgDetailsEditorState> {

  constructor(props) {
    super(props);

    this.onNodeEdit = this.onNodeEdit.bind(this);
    this.onAddSequence = this.onAddSequence.bind(this);

    this.state = {
      currentTab: TABS.Details,
    };
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

  renderTabs() {

    const tabs = ['Content', 'Details', 'Labels', 'Actions']
      .map((title, index) => {
        const active = index === this.state.currentTab ? 'active' : '';
        const classes = 'nav-link ' + active;
        return (
          <a
            key={title}
            className={classes}
            onClick={this.onTabClick.bind(this, index)}>
            {title}
          </a>
        );
      });

    return (
      <ul className="nav nav-tabs">
        {tabs}
      </ul>
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

  renderActiveTabContent(model: models.OrganizationModel) {
    switch (this.state.currentTab) {
      case TABS.Content:
        return this.renderContent(model);
      case TABS.Details:
        return this.renderDetails(model);
      case TABS.Labels:
        return this.renderLabels(model);
      case TABS.Actions:
        return this.renderActions(model);
    }
  }

  render() {

    return this.props.model.caseOf({
      just: (m) => {
        return (
          <div className="org-details-editor">
            <div className="doc-head">

              <h3>Organization: {m.title}</h3>

              {this.renderTabs()}

              <div className="active-tab-content">
                {this.renderActiveTabContent(m)}
              </div>

            </div>
          </div>);
      },
      nothing: () => null,
    });


  }

}
