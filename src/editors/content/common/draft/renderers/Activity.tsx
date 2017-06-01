import * as React from 'react';
import { Activity as ActivityType } from '../../../../../data/content/html/activity';
import PreformattedText from './PreformattedText';
import * as persistence from '../../../../../data/persistence';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Select } from '../../Select';
import { Button } from '../../Button';
import { PurposeTypes } from '../../../../../data/content/html/common';
import { handleInsertion } from './common';
import { LegacyTypes } from '../../../../../data/types';

import ResourceSelection from '../../../../../utils/selection/ResourceSelection';

import './wbinline.scss';

type Data = {
  activity: ActivityType;
};

export interface ActivityProps extends InteractiveRendererProps {
  data: Data;
}

export interface ActivityState extends InteractiveRendererState {
  
}

export interface ActivityProps {
  
}


export class Activity extends InteractiveRenderer<ActivityProps, ActivityState> {

  title: string;
  guid: string;

  constructor(props) {
    super(props, {});

    this.onPurposeEdit = this.onPurposeEdit.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSelectActivity = this.onSelectActivity.bind(this);
    this.onInsert = this.onInsert.bind(this);
    this.onCancel = this.onCancel.bind(this);
    
  }

  onClick() {
    if (this.guid !== null) {
      this.props.blockProps.services.viewDocument(
      this.guid);
    }
    
  }

  onPurposeEdit(purpose) {
    this.props.blockProps.onEdit(
      { activity: this.props.data.activity.with({ purpose }) });
  }

  onCancel() {
    this.props.blockProps.services.dismissModal();
  }

  onInsert(resource) {

    const resources = this.props.blockProps
      .context.courseModel.resources.toArray();

    const found = resources.find(r => r.guid === resource.id);

    if (found !== undefined) {
      this.props.blockProps.services.dismissModal();
      this.props.blockProps.onEdit(
        { activity: this.props.data.activity.with({ idref: found.id }) });
    }

    
  }

  onSelectActivity() {

    const predicate =
      (res: persistence.CourseResource) : boolean => {
        return res.type === LegacyTypes.assessment2;
      };

    this.props.blockProps.services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={this.props.blockProps.context.courseId}
          onInsert={this.onInsert} 
          onCancel={this.onCancel}/>);
  }


  findTitleId() {
    const resources = this.props.blockProps
      .context.courseModel.resources.toArray();

    const resource = resources.find(resource => resource.id === this.props.data.activity.idref);

    if (resource === undefined) {
      this.title = 'Not set';
      this.guid = null;
    } else {
      this.title = resource.title;
      this.guid = resource.guid;
    }
  }

  render() : JSX.Element {
    return (
      <div className="wbinline"
        ref={c => this.focusComponent = c} onFocus={this.onFocus} 
        onBlur={this.onBlur}  onClick={handleInsertion.bind(undefined, this.props)}>
        
        <b>Activity:</b>&nbsp;&nbsp;&nbsp;
        <button onClick={this.onClick} type="button" 
          className="btn btn-link">{this.title}</button>
        <Button editMode={this.props.blockProps.editMode} 
          onClick={this.onSelectActivity}>Set</Button>
        &nbsp;&nbsp;&nbsp;
        <Select editMode={this.props.blockProps.editMode} 
          label="Purpose" value={this.props.data.activity.purpose} onChange={this.onPurposeEdit}>
          {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
      </div>);
  }
}
