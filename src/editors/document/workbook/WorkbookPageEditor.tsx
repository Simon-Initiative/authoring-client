'use strict'

import * as React from 'react';

import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';

import * as models from '../../../data/models';

interface WorkbookPageEditor {
  
}

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState>  {

  constructor(props) {
    super(props);
  }

  onEdit(property : string, content : any) {

    let update = {};
    update[property] = content;

    let changeRequest = (model: models.WorkbookPageModel) => 
      model.with(update);
      
    this.props.onEdit(changeRequest);
  }

  render() {

    const locked = this.props.editingAllowed === null || this.props.editingAllowed === false;
 
    return (
        <div className="container">
            <div className="columns">
                <div className="column col-1"></div>
                <div className="column col-10">
                    <div>
                        <TitleContentEditor content={this.props.model.title}
                          onEdit={(c) => this.onEdit('title', c)} 
                          editingAllowed={this.props.editingAllowed}/>
                        <HtmlContentEditor content={this.props.model.body}
                          onEdit={(c) => this.onEdit('body', c)} 
                          editingAllowed={this.props.editingAllowed}/>
                    </div>
                </div>
                
                <div className="column col-1"></div>
            </div>
        </div>
    )
  }

}

export default WorkbookPageEditor;
