import * as React from 'react';
import { WbInline as WbInlineType } from 'data/content/workbook/wbinline';
import * as persistence from 'data/persistence';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { PurposeTypes } from 'data/content/learning/common';
import { handleInsertion } from './common';
import { LegacyTypes } from 'data/types';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

import ResourceSelection from 'utils/selection/ResourceSelection';

import './wbinline.scss';

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
    
    this.props.services.viewDocument(guid, this.props.context.courseId);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderMain() {
    const inlineAssessmentOptions = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.inline)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <div className="wbInlineEditor">
        <div className="wbInline">
          <Select 
            editMode={this.props.editMode}
            label="Assessment" 
            value={this.props.model.idref} 
            onChange={this.onAssessmentChange}>
            {inlineAssessmentOptions}
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
