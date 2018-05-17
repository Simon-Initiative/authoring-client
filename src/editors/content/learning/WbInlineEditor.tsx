import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { Select } from '../common/Select';
import { PurposeTypes } from 'data/content/learning/common';
import { LegacyTypes } from 'data/types';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './WbInline.scss';

export interface WbInlineEditorProps extends AbstractContentEditorProps<contentTypes.WbInline> {
  onShowSidebar: () => void;
}

export interface WbInlineEditorState {

}

export interface WbInlineEditorProps {

}

export default class WbInlineEditor
  extends AbstractContentEditor<contentTypes.WbInline, WbInlineEditorProps, WbInlineEditorState> {

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
    const inlineAssessmentOptions = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.inline)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
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
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Activity" highlightColor={CONTENT_COLORS.Activity} columns={3}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain() {
    const resource = this.props.context.courseModel.resourcesById.get(this.props.model.idref);
    const title = resource === undefined ? 'Loading...' : resource.title;
    return (
      <div className="wbinline">
        <h5>{title}</h5>
        <button
          onClick={this.onClick}
          type="button"
          className="btn btn-link">
          Edit Assessment
        </button>
      </div>
    );
  }
}
