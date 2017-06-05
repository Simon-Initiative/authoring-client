import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';
import { Xref }  from '../../../data/content/html/xref';
import { AppServices } from '../../common/AppServices';
import { PurposeTypes } from '../../../data/content/html/common';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/Select';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface XrefEditor {
  
}

export interface XrefEditorProps extends AbstractContentEditorProps<Xref> {
  
}

export interface XrefEditorState {
  resources: persistence.CourseResource[];
}

/**
 * The content editor for Table.
 */
export class XrefEditor 
  extends AbstractContentEditor<Xref, XrefEditorProps, XrefEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onTargetEdit = this.onTargetEdit.bind(this);
    this.onIdrefEdit = this.onIdrefEdit.bind(this);

    this.state = {
      resources: [],
    };
  }

  componentDidMount() {
    persistence.fetchCourseResources(this.props.context.courseId)
    .then(resources => this.setState({ resources }));
  }

  shouldComponentUpdate(nextProps, nextState: XrefEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    } else if (nextState.resources !== this.state.resources) {
      return true;
    }
    return false;
  }

  onTargetEdit(target) {
    this.props.onEdit(this.props.model.with({ target }));
  }

  onIdrefEdit(id) {

    const resources = this.props.context.courseModel.resources.toArray();
    const found = resources.find(r => r.guid === id);

    if (found !== undefined && found !== null) {
      const idref = found.id;
      this.props.onEdit(this.props.model.with({ idref }));
    }
    
  }

  render() : JSX.Element {

    const { idref, target } = this.props.model;
    
    return (
      <div className="itemWrapper">

        <InputLabel label="Activity">
          <Select
            editMode={this.props.editMode}
            label=""
            value={idref}
            onChange={this.onIdrefEdit}>
            {this.state.resources.map(a => <option value={a._id}>{a.title}</option>)}
          </Select>
        </InputLabel>

        <InputLabel label="Target">
          <Select
            editMode={this.props.editMode}
            label=""
            value={target}
            onChange={this.onTargetEdit}>
            <option value="new">Open in new tab/window</option>
            <option value="self">Open in this window</option>
          </Select>
        </InputLabel>

      </div>);
  }

}

