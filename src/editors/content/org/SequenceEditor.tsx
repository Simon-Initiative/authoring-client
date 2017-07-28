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
import { Collapse } from '../common/collapse';


import './org.scss';

export interface SequenceEditor {
  
}

export interface SequenceEditorProps extends AbstractContentEditorProps<contentTypes.Sequence> {
  
}

export interface SequenceEditorState {
 
}

export class SequenceEditor 
  extends AbstractContentEditor<contentTypes.Sequence, SequenceEditorProps, SequenceEditorState> {
    
  constructor(props) {
    super(props);

    this.onUnitEdit = this.onUnitEdit.bind(this); 
    this.onModuleEdit = this.onModuleEdit.bind(this);
  }

  onUnitEdit(item: contentTypes.Unit) {

  }

  onModuleEdit(s: contentTypes.Module) {

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
        context={this.props.context} 
        services={this.props.services} editMode={this.props.editMode} />;
    } else if (c.contentType === contentTypes.OrganizationContentTypes.Unit) {
      return <UnitEditor model={c} onEdit={this.onUnitEdit} 
        context={this.props.context} 
        services={this.props.services} editMode={this.props.editMode}/>;
    } else {
      return 'Include Editor';
    }
  }

  render() : JSX.Element {

    return (
      <div className="sequence">
        {this.props.model.title}
        <div className="sequenceChildren">
          {this.props.model.children.map(c => this.renderChild(c))}
        </div>
      </div>);
  }

}

