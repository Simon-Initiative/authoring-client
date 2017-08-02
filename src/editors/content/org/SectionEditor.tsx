import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ItemEditor } from './ItemEditor';
import { OrgCollapse } from './OrgCollapse';
import { renderDraggableNodes, canAcceptDrop, SourceNodeType } from './drag/utils';
import { DragHandle } from './drag/DragHandle';

import './org.scss';


export interface SectionEditor {
  
}

export interface SectionEditorProps extends AbstractContentEditorProps<contentTypes.Section> {
  labels: contentTypes.Labels;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, 
    targetModel: any, index: number) => void;
  connectDragSource?: any;
  parentGuid: string;
}

export interface SectionEditorState {
 
}

export class SectionEditor 
  extends AbstractContentEditor<contentTypes.Section, SectionEditorProps, SectionEditorState> {
    
  constructor(props) {
    super(props);

    this.onItemEdit = this.onItemEdit.bind(this); 
    this.canHandleDrop = this.canHandleDrop.bind(this);
  }

  onItemEdit(item: contentTypes.Item) {

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  canHandleDrop(id, source, sourceIndex: number, destIndex: number, sourceParentGuid) {
    const predicate = (source : SourceNodeType) => {
      const t = source.contentType;
      return t === contentTypes.OrganizationContentTypes.Section
        || t === contentTypes.OrganizationContentTypes.Include
        || t === contentTypes.OrganizationContentTypes.Item;
    };
      
    return canAcceptDrop(
      predicate, source, this.props.model, sourceIndex, destIndex, sourceParentGuid);
  }

  renderChild(c: contentTypes.Section | contentTypes.Item) {
    if (c.contentType === contentTypes.OrganizationContentTypes.Section) {
      return <SectionEditor {...this.props} parentGuid={this.props.model.guid} model={c}/>;
    } else {
      return <ItemEditor model={c} onEdit={this.onItemEdit} 
        parentGuid={this.props.model.guid}
        context={this.props.context} labels={this.props.labels}
        services={this.props.services} editMode={this.props.editMode}/>;
    }
  }

  render() : JSX.Element {

    const caption = 'Section: ' + this.props.model.title;

    const children = renderDraggableNodes(
      this.props.model.children, this.renderChild.bind(this), 
      this.canHandleDrop, this.props.onReposition, this.props.editMode, this.props.model);

    return (
      <div className="section">
        <DragHandle connectDragSource={this.props.connectDragSource}/>
        <OrgCollapse caption={caption}>
          <div className="sectionChildren">
            {children}
          </div>
        </OrgCollapse>
      </div>);
  }

}

