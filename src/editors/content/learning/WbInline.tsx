import * as React from 'react';
import { WbInline as WbInlineType } from 'data/content/workbook/wbinline';
import { Select } from '../common/Select';
import { PurposeTypes } from 'data/content/learning/common';
import { LegacyTypes } from 'data/types';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';

import './Wbinline.scss';

export interface WbInlineProps extends AbstractContentEditorProps<WbInlineType> {

}

export interface WbInlineState {

}

export interface WbInlineProps {

}

export class WbInline extends AbstractContentEditor<WbInlineType, WbInlineProps, WbInlineState> {

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
    return (
      <ToolbarGroup label="Assessment" hide />
    );
  }

  renderMain() {
    return (
      <div className="wbinline">
        <h5>{this.props.context.courseModel.resourcesById.get(this.props.model.idref).title}</h5>
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
