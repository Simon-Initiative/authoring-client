import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { Select } from 'editors/content/common/Select';
import { PurposeTypes } from 'data/content/learning/common';
import { LegacyTypes } from 'data/types';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './WbInline.scss';
import { ResourceState } from 'data/content/resource';
import { Maybe } from 'tsmonad';
import { Map } from 'immutable';
import { CourseModel } from 'data/models';

export interface WbInlineEditorProps extends AbstractContentEditorProps<contentTypes.WbInline> {
  onShowSidebar: () => void;
}

export interface WbInlineEditorState {

}

export interface WbInlineEditorProps {
  course: CourseModel;
}

export default class WbInlineEditor
  extends AbstractContentEditor<contentTypes.WbInline, WbInlineEditorProps, WbInlineEditorState> {

  constructor(props) {
    super(props);

    this.onPurposeEdit = this.onPurposeEdit.bind(this);
    this.onAssessmentChange = this.onAssessmentChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate(nextProps: WbInlineEditorProps): boolean {
    return this.props.model !== nextProps.model;
  }

  onPurposeEdit(purpose: string): void {
    const model = this.props.model.with({
      purpose: purpose === '' ? Maybe.nothing() : Maybe.just(purpose),
    });
    this.props.onEdit(model, model);
  }

  onAssessmentChange(idref: string): void {
    const model = this.props.model.with({ idref });
    this.props.onEdit(model, model);
  }

  onClick(): void {
    this.props.services.viewDocument(
      this.props.model.idref,
      this.props.context.courseModel.idvers, Maybe.just(this.props.context.orgId));
  }

  renderSidebar() {
    const inlineAssessmentOptions = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.inline && r.resourceState !== ResourceState.DELETED)
      .map(r => <option key={r.guid} value={r.id}>{r.title}</option>);

    const embedActivityTypes = this.props.context.courseModel.embedActivityTypes;
    const isReplActivity = embedActivityTypes.get(this.props.model.idref) === 'REPL';

    // A purpose is not required, so we need to add an option for an empty type
    const purposeTypesWithEmpty = PurposeTypes.slice();
    purposeTypesWithEmpty.unshift({ value: '', label: '' });

    return isReplActivity
      ? (
        <SidebarContent title="REPL Activity">
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
      )
      : (
        <SidebarContent title="Inline Assessment">
          <SidebarGroup label="Assessment">
            <Select
              editMode={this.props.editMode}
              value={this.props.model.idref}
              onChange={this.onAssessmentChange}>
              {inlineAssessmentOptions}
            </Select>
          </SidebarGroup>
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

    const embedActivityTypes = this.props.context.courseModel.embedActivityTypes;
    const isReplActivity = embedActivityTypes.get(this.props.model.idref) === 'REPL';
    const title = isReplActivity ? 'REPL Activity' : 'Assessment';

    return (
      <ToolbarGroup label={title} highlightColor={CONTENT_COLORS.WbInline} columns={3}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fas fa-sliders-h" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderIcon() {
    const { model, course } = this.props;
    const iconStyle = { color: CONTENT_COLORS.WbInline };

    switch (course.embedActivityTypes.get(model.idref)) {
      case 'REPL':
        return (
          <i className="fa fa-terminal" style={iconStyle} />
        );
      default:
        return (
          <i className="fa fa-flask" style={iconStyle} />
        );
    }
  }

  renderActivityName() {
    const { model, course } = this.props;
    const iconStyle = { color: CONTENT_COLORS.WbInline };

    switch (course.embedActivityTypes.get(model.idref)) {
      case 'REPL':
        return 'REPL Activity';
      default:
        return 'Formative Assessment';
    }
  }

  renderMain() {
    const resource = this.props.context.courseModel.resourcesById.get(this.props.model.idref);
    const title = resource === undefined ? 'Loading...' : resource.title;

    return (
      <div className="wbinline">
        <h5>{this.renderIcon()} {title}</h5>
        <button
          onClick={this.onClick}
          type="button"
          className="btn btn-link">
          Edit {this.renderActivityName()}
        </button>
      </div>
    );
  }
}
