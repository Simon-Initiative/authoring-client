import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ItemEditor } from './ItemEditor';
import { SectionEditor } from './SectionEditor';
import { Collapse } from '../common/Collapse';

import './org.scss';


export interface ModuleEditor {
  
}

export interface ModuleEditorProps extends AbstractContentEditorProps<contentTypes.Module> {
  
}

export interface ModuleEditorState {
 
}

export class ModuleEditor 
  extends AbstractContentEditor<contentTypes.Module, ModuleEditorProps, ModuleEditorState> {
    
  constructor(props) {
    super(props);

    this.onItemEdit = this.onItemEdit.bind(this); 
  }

  onItemEdit(item: contentTypes.Item) {

  }

  onSectionEdit(s: contentTypes.Section) {

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
    const caption = 'Module: ' + this.props.model.title;
    return (
      <div className="module">
        <Collapse caption={caption}>
          <div className="moduleChildren">
            {this.props.model.children.map(c => this.renderChild(c))}
          </div>
        </Collapse>
      </div>);
  }

}

