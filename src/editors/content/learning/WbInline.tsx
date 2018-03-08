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
    // this.onClick = this.onClick.bind(this);
    // this.onSelectActivity = this.onSelectActivity.bind(this);
    // this.onInsert = this.onInsert.bind(this);
    // this.onCancel = this.onCancel.bind(this);

  }

  shouldComponentUpdate(nextProps) {
    return this.props.model !== nextProps.model;
  }

  // onClick() {
  //   const guid = this.props.blockProps.context.courseModel.resourcesById.get(
  //     this.props.data.wbinline.idRef).guid;

  //   this.props.blockProps.services.viewDocument(
  //       guid,
  //       this.props.blockProps.context.courseId);
  // }

  onPurposeEdit(purpose) {
    const model = this.props.model.with({ purpose });
    this.props.onEdit(model, model);
  }

  // onSelectActivity() {
  //  update to only non-inserted activities
  //   const predicate =
  //     (res: persistence.CourseResource) : boolean => {
  //       return res.type === LegacyTypes.inline;
  //     };
  // }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderMain() {
    const lowStakesOptions = this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === LegacyTypes.inline)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    return (
      <div className="wbInlineEditor">
        <div className="wbInline">
          <Select 
            editMode={this.props.editMode}
            label="Assessment" 
            value={this.props.model.idRef} 
            onChange={src => this.props.onEdit(this.props.model.with({ src }))}>
            {lowStakesOptions}
          </Select>
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

    // const title = this.props.context.courseModel
    //   .resourcesById.has(this.props.data.wbinline.idRef)
    //   ? this.props.blockProps.context.courseModel
    //   .resourcesById.get(this.props.data.wbinline.idRef).title
    //   : 'Loading...';

    // const canLoad = this.props.context.courseModel
    //   .resourcesById.has(this.props.data.wbinline.idRef);
}

