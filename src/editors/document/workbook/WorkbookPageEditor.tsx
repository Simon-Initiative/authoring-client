'use strict'

import * as React from 'react';

import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import Toolbar from './Toolbar';

import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';

import * as models from '../../../data/models';




interface WorkbookPageEditor {
  
}

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  
  editHistory: AuthoringActions[];
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState> 
  implements AuthoringActionsHandler {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };
  }

  
  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: [action, ...this.state.editHistory]
    });
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
      <div>
          <TitleContentEditor 
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            content={this.props.model.title}
            onEdit={(c) => this.onEdit('title', c)} 
            editingAllowed={this.props.editingAllowed}/>
          
          <HtmlContentEditor 
              activeSubEditorKey={this.props.activeSubEditorKey}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              editHistory={this.state.editHistory}
              content={this.props.model.body}
              onEdit={(c) => this.onEdit('body', c)} 
              editingAllowed={this.props.editingAllowed}>

              <Toolbar 
                courseId={this.props.model.courseId} 
                services={this.props.services} 
                actionHandler={this} />
          </HtmlContentEditor>
          
      </div>
    )
  }

}

export default WorkbookPageEditor;
