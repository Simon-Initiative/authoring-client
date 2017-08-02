import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { DragHandle } from './drag/DragHandle';
import { Collapse } from '../common/collapse';

import './org.scss';


export interface ItemEditor {
  
}

export interface ItemEditorProps extends AbstractContentEditorProps<contentTypes.Item> {
  labels: contentTypes.Labels;
  parentGuid: string;
  connectDragSource?: any;
}

export interface ItemEditorState {
 
}

export class ItemEditor 
  extends AbstractContentEditor<contentTypes.Item, ItemEditorProps, ItemEditorState> {
    
  constructor(props) {
    super(props);
    
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  

  render() : JSX.Element {

    const resource = this.props.context.courseModel.resourcesById.get(
      this.props.model.resourceref.idref);

    return (
      <div className="item">
        <DragHandle connectDragSource={this.props.connectDragSource}/>
        {resource.title}
      </div>);
  }

}

