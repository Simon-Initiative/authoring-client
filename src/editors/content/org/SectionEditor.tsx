import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ItemEditor } from './ItemEditor';
import { Collapse } from '../common/Collapse';

import './org.scss';


export interface SectionEditor {
  
}

export interface SectionEditorProps extends AbstractContentEditorProps<contentTypes.Section> {
  
}

export interface SectionEditorState {
 
}

export class SectionEditor 
  extends AbstractContentEditor<contentTypes.Section, SectionEditorProps, SectionEditorState> {
    
  constructor(props) {
    super(props);

    this.onItemEdit = this.onItemEdit.bind(this); 
  }

  onItemEdit(item: contentTypes.Item) {

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  renderChild(c: contentTypes.Section | contentTypes.Item) {
    if (c.contentType === contentTypes.OrganizationContentTypes.Section) {
      return <SectionEditor {...this.props} model={c}/>;
    } else {
      return <ItemEditor model={c} onEdit={this.onItemEdit} 
        context={this.props.context} 
        services={this.props.services} editMode={this.props.editMode}/>;
    }
  }

  render() : JSX.Element {

    const caption = 'Section: ' + this.props.model.title;

    return (
      <div className="section">
        <Collapse caption={caption}>
          <div className="sectionChildren">
            {this.props.model.children.map(c => this.renderChild(c))}
          </div>
        </Collapse>
      </div>);
  }

}

