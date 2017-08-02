import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ItemEditor } from './ItemEditor';
import { SectionEditor } from './SectionEditor';
import { OrgCollapse } from './OrgCollapse';
import { DragHandle } from './drag/DragHandle';
import { renderDraggableNodes, canAcceptDrop, SourceNodeType } from './drag/utils';


import './org.scss';


export interface ModuleEditor {
  
}

export interface ModuleEditorProps extends AbstractContentEditorProps<contentTypes.Module> {
  labels: contentTypes.Labels;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, 
    targetModel: any, index: number) => void;
  connectDragSource?: any;
  parentGuid: string;
}

export interface ModuleEditorState {
 
}

export class ModuleEditor 
  extends AbstractContentEditor<contentTypes.Module, ModuleEditorProps, ModuleEditorState> {
    
  constructor(props) {
    super(props);

    this.onItemEdit = this.onItemEdit.bind(this); 
    this.canHandleDrop = this.canHandleDrop.bind(this);
  }

  onItemEdit(item: contentTypes.Item) {

  }

  onSectionEdit(s: contentTypes.Section) {

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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  renderChild(c: contentTypes.Section | contentTypes.Item | contentTypes.Include) {
    if (c.contentType === contentTypes.OrganizationContentTypes.Section) {
      return <SectionEditor model={c} onEdit={this.onSectionEdit} 
        onReposition={this.props.onReposition}
        parentGuid={this.props.model.guid}
        context={this.props.context} labels={this.props.labels}
        services={this.props.services} editMode={this.props.editMode} />;
    } else if (c.contentType === contentTypes.OrganizationContentTypes.Item) {
      return <ItemEditor model={c} onEdit={this.onItemEdit} 
        parentGuid={this.props.model.guid}
        context={this.props.context} labels={this.props.labels}
        services={this.props.services} editMode={this.props.editMode}/>;
    } else {
      return 'Include Editor';
    }
  }

  render() : JSX.Element {
    const caption = 'Module: ' + this.props.model.title;

    const children = renderDraggableNodes(
      this.props.model.children, this.renderChild.bind(this), 
      this.canHandleDrop, this.props.onReposition, this.props.editMode, this.props.model);

    return (
      <div className="module">
        <DragHandle connectDragSource={this.props.connectDragSource}/>
        <OrgCollapse caption={caption}>
          <div className="moduleChildren">
            {children}
          </div>
        </OrgCollapse>
      </div>);
  }

}

