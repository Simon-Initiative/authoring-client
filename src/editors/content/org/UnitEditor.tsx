import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ItemEditor } from './ItemEditor';
import { SectionEditor } from './SectionEditor';
import { ModuleEditor } from './ModuleEditor';
import { OrgCollapse } from './OrgCollapse';
import { renderDraggableNodes, canAcceptDrop, SourceNodeType } from './drag/utils';
import { DragHandle } from './drag/DragHandle';

import './org.scss';


export interface UnitEditor {
  
}

export interface UnitEditorProps extends AbstractContentEditorProps<contentTypes.Unit> {
  labels: contentTypes.Labels;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, 
    targetModel: any, index: number) => void;
  connectDragSource?: any;
  parentGuid: string;
}

export interface UnitEditorState {
 
}

export class UnitEditor 
  extends AbstractContentEditor<contentTypes.Unit, UnitEditorProps, UnitEditorState> {
    
  constructor(props) {
    super(props);

    this.onItemEdit = this.onItemEdit.bind(this); 
    this.onModuleEdit = this.onModuleEdit.bind(this);
    this.canHandleDrop = this.canHandleDrop.bind(this);
  }

  onItemEdit(item: contentTypes.Item) {

  }

  onModuleEdit(s: contentTypes.Module) {

  }

  canHandleDrop(id, source, sourceIndex: number, destIndex: number, sourceParentGuid) {
    const predicate = (source : SourceNodeType) => {
      const t = source.contentType;
      return t === contentTypes.OrganizationContentTypes.Module
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

  renderChild(c: contentTypes.Module | contentTypes.Item | contentTypes.Include) {
    if (c.contentType === contentTypes.OrganizationContentTypes.Module) {
      return <ModuleEditor model={c} onEdit={this.onModuleEdit} 
        parentGuid={this.props.model.guid}
        context={this.props.context} labels={this.props.labels}
        onReposition={this.props.onReposition}
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

    const caption = 'Unit: ' + this.props.model.title;

    const children = renderDraggableNodes(
      this.props.model.children, this.renderChild.bind(this), 
      this.canHandleDrop, this.props.onReposition, this.props.editMode, this.props.model);

    return (
      <div className="unit">
        <DragHandle connectDragSource={this.props.connectDragSource}/>
        <OrgCollapse caption={caption}>
          <div className="unitChildren">
            {children}
          </div>
        </OrgCollapse>
      </div>);
  }

}

