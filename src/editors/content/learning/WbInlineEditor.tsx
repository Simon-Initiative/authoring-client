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
    const guid = this.props.context.courseModel.resourcesById
      .get(this.props.model.idref).guid;

    this.props.services.viewDocument(guid, this.props.context.courseId);
  }

  renderSidebar() {
    const inlineAssessmentOptions = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.inline && r.resourceState !== ResourceState.DELETED)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    // A purpose is not required, so we need to add an option for an empty type
    const purposeTypesWithEmpty = PurposeTypes.slice();
    purposeTypesWithEmpty.unshift({ value: '', label: '' });

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
      <ToolbarGroup label="Assessment" highlightColor={CONTENT_COLORS.WbInline} columns={3}>
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
