import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';
import { ActivityLink }  from '../../../data/content/html/activity_link';
import { AppServices } from '../../common/AppServices';
import { PurposeTypes } from '../../../data/content/html/common';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/Select';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface ActivityLinkEditor {
  
}

export interface ActivityLinkEditorProps extends AbstractContentEditorProps<ActivityLink> {
  
}

export interface ActivityLinkEditorState {
  activities: persistence.CourseResource[];
}

/**
 * The content editor for Table.
 */
export class ActivityLinkEditor 
  extends AbstractContentEditor<ActivityLink, ActivityLinkEditorProps, ActivityLinkEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onTargetEdit = this.onTargetEdit.bind(this);
    this.onIdrefEdit = this.onIdrefEdit.bind(this);
    this.onPurposeEdit = this.onPurposeEdit.bind(this);

    this.state = {
      activities: [],
    };
  }

  componentDidMount() {
    persistence.fetchCourseResources(this.props.context.courseId)
    .then((resources) => {
      console.log(resources);
      return resources;
    })
    .then(resources => resources.filter(r => r.type === 'x-oli-inline-assessment'))
    .then(activities => this.setState({ activities }));
  }

  shouldComponentUpdate(nextProps, nextState: ActivityLinkEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    } else if (nextState.activities !== this.state.activities) {
      return true;
    }
    return false;
  }

  onTargetEdit(target) {
    this.props.onEdit(this.props.model.with({ target }));
  }

  onIdrefEdit(idref) {
    this.props.onEdit(this.props.model.with({ idref }));
  }

  onPurposeEdit(purpose) {
    this.props.onEdit(this.props.model.with({ purpose }));
  }

  render() : JSX.Element {

    const { idref, purpose, target } = this.props.model;
    
    return (
      <div className="itemWrapper">

        <InputLabel label="Activity">
          <Select
            label=""
            value={idref}
            onChange={this.onIdrefEdit}>
            {this.state.activities.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
          </Select>
        </InputLabel>

        <InputLabel label="Target">
          <Select
            label=""
            value={target}
            onChange={this.onTargetEdit}>
            <option key="new" value="new">Open in new tab/window</option>
            <option key="self" value="self">Open in this window</option>
          </Select>
        </InputLabel>

        <InputLabel label="Purpose">
          <Select
            label=""
            value={purpose}
            onChange={this.onPurposeEdit}>
            {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </InputLabel>
        
      </div>);
  }

}

