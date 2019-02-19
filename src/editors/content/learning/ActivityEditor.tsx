import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { Select } from 'editors/content/common/Select';
import { PurposeTypes } from 'data/content/learning/common';
import { LegacyTypes } from 'data/types';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';

import { styles } from 'editors/content/learning/Activity.styles';
import { ResourceState } from 'data/content/resource';
import { Maybe } from 'tsmonad';

export interface ActivityEditorProps extends AbstractContentEditorProps<contentTypes.Activity> {
  onShowSidebar: () => void;
}

export interface ActivityEditorState {

}

export interface ActivityEditorProps {

}

@injectSheet(styles)
export default class ActivityEditor
  extends AbstractContentEditor<contentTypes.Activity,
  StyledComponentProps<ActivityEditorProps>, ActivityEditorState> {
  constructor(props) {
    super(props);

    this.onPurposeEdit = this.onPurposeEdit.bind(this);
    this.onAssessmentChange = this.onAssessmentChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate(nextProps: ActivityEditorProps): boolean {
    return this.props.model !== nextProps.model;
  }

  isFeedback() {
    return this.props.model.purpose.caseOf({
      just: p => p === contentTypes.PurposeTypes.MyResponse,
      nothing: () => false,
    });
  }

  onPurposeEdit(purpose: string): void {
    const model = this.props.model.with({
      purpose: purpose === '' ? Maybe.nothing() : Maybe.just(purpose),
    });
    this.props.onEdit(model, model);
  }

  onAssessmentChange(idref): void {
    const model = this.props.model.with({ idref });
    this.props.onEdit(model, model);
  }

  onClick(): void {
    const guid = this.props.context.courseModel.resourcesById
      .get(this.props.model.idref).guid;

    this.props.services.viewDocument(guid, this.props.context.courseId);
  }

  renderSidebar() {
    const summatives = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.assessment2 && r.resourceState !== ResourceState.DELETED)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    const feedbacks = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.feedback && r.resourceState !== ResourceState.DELETED)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    // A purpose is not required, so we need to add an option for an empty type.
    // My Response is specifically for feedback activities, so they cannot be chosen by
    // non-feedback assessments.
    const purposeTypesWithEmpty = PurposeTypes.slice()
      .filter(p => p.value !== contentTypes.PurposeTypes.MyResponse);
    purposeTypesWithEmpty.unshift({ value: '', label: '' });

    const activitySelect = options => <SidebarGroup label="Assessment">
      <Select
        editMode={this.props.editMode}
        value={this.props.model.idref}
        onChange={this.onAssessmentChange}>
        {options}
      </Select>
    </SidebarGroup>;

    if (this.isFeedback()) {
      return <SidebarContent title="Feedback">
        {activitySelect(feedbacks)}
      </SidebarContent>;
    }

    return (
      <SidebarContent title="Activity" >
        {activitySelect(summatives)}

        <SidebarGroup label="Purpose">
          <Select
            editMode={this.props.editMode}
            value={this.props.model.purpose.valueOr('')}
            onChange={this.onPurposeEdit}>
            {purposeTypesWithEmpty.map(p =>
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
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label={this.isFeedback() ? 'Feedback' : 'Activity'}
        highlightColor={CONTENT_COLORS.Activity} columns={3}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>);
  }

  renderMain() {
    const { classes } = this.props;

    const resource = this.props.context.courseModel.resourcesById.get(this.props.model.idref);

    const titleOrPlaceholder = resource !== undefined
      ? resource.title
      : 'Loading...';

    const iconStyle = { color: CONTENT_COLORS.Activity };

    return (
      <div className={classNames(['ActivityEditor', classes.activity])}>
        <h5><i className="fa fa-check" style={iconStyle} /> {titleOrPlaceholder}</h5>
        <button
          onClick={this.onClick}
          type="button"
          className="btn btn-link">
          Edit {this.isFeedback() ? 'Feedback' : 'Summative'} Assessment
        </button>
      </div>
    );
  }
}
