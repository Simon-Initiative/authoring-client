import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ItemEditor } from './ItemEditor';
import { UnitEditor } from './UnitEditor';
import { ModuleEditor } from './ModuleEditor';
import { OrgCollapse } from './OrgCollapse';
import { canAcceptDrop, SourceNodeType } from './drag/utils';
import { DragHandle } from './drag/DragHandle';
import { OrgTable } from './OrgTable';

import './org.scss';

export interface SequenceEditor {
  
}

export interface SequenceEditorProps extends AbstractContentEditorProps<contentTypes.Sequence> {
  labels: contentTypes.Labels;
  onReposition: (
    sourceNode: Object, sourceParentGuid: string, 
    targetModel: any, index: number) => void;
  parentGuid: string;
  connectDragSource?: any;
}

export interface SequenceEditorState {
 
}

export class SequenceEditor 
  extends AbstractContentEditor<contentTypes.Sequence, SequenceEditorProps, SequenceEditorState> {
    
  constructor(props) {
    super(props);

    this.onUnitEdit = this.onUnitEdit.bind(this); 
    this.onModuleEdit = this.onModuleEdit.bind(this);

    this.canHandleDrop = this.canHandleDrop.bind(this);
  }

  onUnitEdit(item: contentTypes.Unit) {

  }

  onModuleEdit(s: contentTypes.Module) {

  }

  canHandleDrop(id, source, sourceIndex: number, destIndex: number, sourceParentGuid) {
    const predicate = (source : SourceNodeType) => {
      if (source.contentType === contentTypes.OrganizationContentTypes.Unit) {
        return !this.props.model.children.toArray().some(
          child => child.contentType === contentTypes.OrganizationContentTypes.Module);
      } else if (source.contentType === contentTypes.OrganizationContentTypes.Module) {
        return !this.props.model.children.toArray().some(
          child => child.contentType === contentTypes.OrganizationContentTypes.Unit);
      } else if  (source.contentType === contentTypes.OrganizationContentTypes.Include) {
        return true;
      } else {
        return false;
      }
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

  renderChild(c: contentTypes.Module | contentTypes.Unit | contentTypes.Include) {
    if (c.contentType === contentTypes.OrganizationContentTypes.Module) {
      return <ModuleEditor model={c} onEdit={this.onModuleEdit} 
        context={this.props.context} labels={this.props.labels}
        parentGuid={this.props.model.guid}
        onReposition={this.props.onReposition}
        services={this.props.services} editMode={this.props.editMode} />;
    } else if (c.contentType === contentTypes.OrganizationContentTypes.Unit) {
      return <UnitEditor model={c} onEdit={this.onUnitEdit} 
        context={this.props.context} labels={this.props.labels}
        parentGuid={this.props.model.guid}
        onReposition={this.props.onReposition}
        services={this.props.services} editMode={this.props.editMode}/>;
    } else {
      return 'Include Editor';
    }
  }

  render() : JSX.Element {

    const children = this.props.children;

    const caption = 'Sequence: ' + this.props.model.title;

    return (
      <div className="sequence">
        <DragHandle connectDragSource={this.props.connectDragSource}/>
        <OrgCollapse caption={caption}>
          <div className="sequenceChildren">
            <OrgTable>
              {children}
            </OrgTable>
          </div>
        </OrgCollapse>
      </div>);
  }

}

