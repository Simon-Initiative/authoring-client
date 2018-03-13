import * as React from 'react';
import { Activity as ActivityType } from 'data/content/workbook/activity';
import * as persistence from 'data/persistence';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { PurposeTypes } from 'data/content/learning/common';
import { handleInsertion } from './common';
import { LegacyTypes } from 'data/types';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import ResourceSelection from 'utils/selection/ResourceSelection';

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
    return (
      <SidebarContent title="Assessment" isEmpty />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Assessment" hide />
    );
  }

  renderMain() {
    const activityOptions = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.assessment2)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <div className="activityEditor">
        <div className="activity">
          <Select
            editMode={this.props.editMode}
            label="Assessment"
            value={this.props.model.idref}
            onChange={this.onAssessmentChange}>
            {activityOptions}
          </Select>
          <button onClick={this.onClick} type="button"
          className="btn btn-link">View</button>
        </div>

        <div>
          <Select
            editMode={this.props.editMode}
            label="Purpose"
            value={this.props.model.purpose}
            onChange={this.onPurposeEdit}>
            {PurposeTypes.map(p =>
              <option
                key={p.value}
                value={p.value}>
                {p.label}
              </option>)}
          </Select>
        </div>
      </div>
    );
  }
}
