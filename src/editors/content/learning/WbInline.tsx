import * as React from 'react';
import { WbInline as WbInlineType } from '../../../../../data/content/html/wbinline';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import * as persistence from '../../../../../data/persistence';
import { Select } from '../../Select';
import { Button } from '../../Button';
import { PurposeTypes } from '../../../../../data/content/html/common';
import { handleInsertion } from './common';
import { LegacyTypes } from '../../../../../data/types';

import ResourceSelection from '../../../../../utils/selection/ResourceSelection';

import './wbinline.scss';

type Data = {
  wbinline: WbInlineType;
};

export interface WbInlineProps extends InteractiveRendererProps {
  data: Data;
}

export interface WbInlineState extends InteractiveRendererState {

}

export interface WbInlineProps {

}


export class WbInline extends InteractiveRenderer<WbInlineProps, WbInlineState> {

  constructor(props) {
    super(props, { });

    this.onPurposeEdit = this.onPurposeEdit.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSelectActivity = this.onSelectActivity.bind(this);
    this.onInsert = this.onInsert.bind(this);
    this.onCancel = this.onCancel.bind(this);

  }

  onClick() {
    const guid = this.props.blockProps.context.courseModel.resourcesById.get(
      this.props.data.wbinline.idRef).guid;

    this.props.blockProps.services.viewDocument(
        guid,
        this.props.blockProps.context.courseId);
  }

  onPurposeEdit(purpose) {
    this.props.blockProps.onEdit({ wbinline: this.props.data.wbinline.with({ purpose }) });
  }

  onCancel() {
    this.props.blockProps.services.dismissModal();
  }

  onInsert(resource) {
    this.props.blockProps.services.dismissModal();

    const resources = this.props.blockProps
      .context.courseModel.resources.toArray();

    const found = resources.find(r => r.guid === resource.id);

    if (found !== undefined) {

      this.props.blockProps.onEdit(
        { wbinline: this.props.data.wbinline.with({ idRef: found.id }) });
    }

  }

  onSelectActivity() {

    const predicate =
      (res: persistence.CourseResource) : boolean => {
        return res.type === LegacyTypes.inline;
      };

    this.props.blockProps.services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={this.props.blockProps.context.courseId}
          onInsert={this.onInsert}
          onCancel={this.onCancel}/>);
  }

  render() : JSX.Element {

    const title = this.props.blockProps.context.courseModel
      .resourcesById.has(this.props.data.wbinline.idRef)
      ? this.props.blockProps.context.courseModel
      .resourcesById.get(this.props.data.wbinline.idRef).title
      : 'Loading...';

    const canLoad = this.props.blockProps.context.courseModel
      .resourcesById.has(this.props.data.wbinline.idRef);

    return (
      <div className="wbinline"
        ref={c => this.focusComponent = c} onFocus={this.onFocus}
        onBlur={this.onBlur}  onClick={handleInsertion.bind(undefined, this.props)}>
        <b>Inline Assessment:</b>&nbsp;&nbsp;&nbsp;
        <button onClick={this.onClick} type="button"
          disabled={!canLoad}
          className="btn btn-link">{title}</button>
        <Button editMode={this.props.blockProps.editMode}
          onClick={this.onSelectActivity}>Edit</Button>
        <div style={ { float: 'right' } }>
          <Select editMode={this.props.blockProps.editMode}
            label="Purpose" value={this.props.data.wbinline.purpose} onChange={this.onPurposeEdit}>
            {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </div>
      </div>);
  }
}
