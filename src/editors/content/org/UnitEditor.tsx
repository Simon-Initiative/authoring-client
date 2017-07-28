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
import { Collapse } from '../common/collapse';


import './org.scss';


export interface UnitEditor {
  
}

export interface UnitEditorProps extends AbstractContentEditorProps<contentTypes.Unit> {
  
}

export interface UnitEditorState {
 
}

export class UnitEditor 
  extends AbstractContentEditor<contentTypes.Unit, UnitEditorProps, UnitEditorState> {
    
  constructor(props) {
    super(props);

    this.onItemEdit = this.onItemEdit.bind(this); 
    this.onModuleEdit = this.onModuleEdit.bind(this);
  }

  onItemEdit(item: contentTypes.Item) {

  }

  onModuleEdit(s: contentTypes.Module) {

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
        context={this.props.context} 
        services={this.props.services} editMode={this.props.editMode} />;
    } else if (c.contentType === contentTypes.OrganizationContentTypes.Item) {
      return <ItemEditor model={c} onEdit={this.onItemEdit} 
        context={this.props.context} 
        services={this.props.services} editMode={this.props.editMode}/>;
    } else {
      return 'Include Editor';
    }
  }

  render() : JSX.Element {

    return (
      <div className="unit">
        {this.props.model.title}
        <div className="unitChildren">
          {this.props.model.children.map(c => this.renderChild(c))}
        </div>
      </div>);
  }

}

