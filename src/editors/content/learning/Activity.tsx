import * as React from 'react';
import { Activity as ActivityType } from 'data/content/workbook/activity';
import { Select } from '../common/Select';
import { PurposeTypes } from 'data/content/learning/common';
import { LegacyTypes } from 'data/types';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';

export interface ActivityProps extends AbstractContentEditorProps<ActivityType> {

}

export interface ActivityState {

}

export interface ActivityProps {

}


export class Activity extends AbstractContentEditor<ActivityType, ActivityProps, ActivityState> {
  constructor(props) {
    super(props);

    this.onPurposeEdit = this.onPurposeEdit.bind(this);
    this.onAssessmentChange = this.onAssessmentChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.model !== nextProps.model;
  }

  onPurposeEdit(purpose) {
    const model = this.props.model.with({ purpose });
    this.props.onEdit(model, model);
  }

  onAssessmentChange(idref) {
    const model = this.props.model.with({ idref });
    this.props.onEdit(model, model);
  }

  onClick() {
    const guid = this.props.context.courseModel.resourcesById
      .get(this.props.model.idref).guid;

    this.props.services.viewDocument(guid, this.props.context.courseId);
  }

  renderSidebar() {
    const activityOptions = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.assessment2)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <SidebarContent title="Activity">
        <SidebarGroup label="Assessment">
          <Select
            editMode={this.props.editMode}
            value={this.props.model.idref}
            onChange={this.onAssessmentChange}>
            {activityOptions}
          </Select>
        </SidebarGroup>

        <SidebarGroup label="Purpose">
          <Select
            editMode={this.props.editMode}
            value={this.props.model.purpose}
            onChange={this.onPurposeEdit}>
            {PurposeTypes.map(p =>
              <option
                key={p.value}
                value={p.value}>
                {p.label}
              </option>)}
          </Select>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Activity" hide />
    );
  }

  renderMain() {
    return (
      <div className="activityEditor">
        <h5>{this.props.context.courseModel.resourcesById.get(this.props.model.idref).title}</h5>
        <button
          onClick={this.onClick}
          type="button"
          className="btn btn-link">
          Edit activity
        </button>
      </div>
    );
  }
}
