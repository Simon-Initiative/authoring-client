import * as React from 'react';

import * as models from 'data/models';

import * as contentTypes from 'data/contentTypes';
import { Actions } from 'editors/document/org/Actions.controller';
import { Details } from 'editors/document/org/Details';
import { LabelsEditor } from 'editors/content/org/LabelsEditor';
import { duplicateOrganization } from 'actions/models';
import * as Messages from 'types/messages';
import * as org from 'data/models/utils/org';
import { Maybe } from 'tsmonad';


import './OrgMetadataEditor.scss';

export interface OrgMetadataEditorProps {
  model: Maybe<models.OrganizationModel>;
  onEdit: (request: org.OrgChangeRequest) => void;
  editMode: boolean;
  dispatch: any;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  course: models.CourseModel;
}

const enum TABS {
  Content = 0,
  Details = 1,
  Labels = 2,
  Actions = 3,
}

interface OrgMetadataEditorState {
  currentTab: TABS;
}

class OrgMetadataEditor extends React.Component<OrgMetadataEditorProps,
  OrgMetadataEditorState>  {

  constructor(props: OrgMetadataEditorProps) {
    super(props);

    this.onLabelsEdit = this.onLabelsEdit.bind(this);
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

  onLabelsEdit(labels) {
    const update = org.makeUpdateRootModel(m => m.with({ labels }));
    this.props.onEdit(update);
  }

  renderLabels(model: models.OrganizationModel) {
    return (
      <div className="org-tab">
        <LabelsEditor
          onEdit={this.onLabelsEdit}
          editMode={this.props.editMode}
          model={model} />
      </div>
    );
  }

  onAddSequence() {

    const mapper = (model) => {
      const s: contentTypes.Sequence = new contentTypes.Sequence()
        .with({ title: 'New ' + model.labels.sequence });
      const sequences = model.sequences
        .with({ children: model.sequences.children.set(s.guid, s) });

      return model.with({ sequences });
    };

    this.props.onEdit(org.makeUpdateRootModel(mapper));
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
    return null;
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
          <div className="org-editor">
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

export default OrgMetadataEditor;
