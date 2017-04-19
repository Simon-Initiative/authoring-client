'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import InlineToolbar from '../../content/html/InlineToolbar';
import BlockToolbar from '../../content/html//BlockToolbar';

import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';

import * as models from '../../../data/models';


interface WorkbookPageEditor {
  
}

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  
  editHistory: Immutable.List<AuthoringActions>;
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState> 
  implements AuthoringActionsHandler {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: Immutable.List<AuthoringActions>()
    };
  }

  
  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
    });
  }


  onEdit(property : string, content : any) {

    let model; 

    if (property === 'title') {
      const head = model.head.with({ title: content});
      model = this.props.model.with({ head });
        
    } else {
      model = this.props.model.with({ body: content });
    }
      
    this.props.onEdit(model);
  }

  render() {

    const inlineToolbar = <InlineToolbar 
                courseId={this.props.model.courseId} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                documentId={this.props.context.documentId}
                courseId={this.props.model.courseId} 
                services={this.props.services} 
                actionHandler={this} />;

    return (
      <div>
          <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.head.title}
            onEdit={(c) => this.onEdit('title', c)} 
            />
          
          <HtmlContentEditor 
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              editHistory={this.state.editHistory}
              model={this.props.model.body}
              onEdit={(c) => this.onEdit('body', c)} 
              />

              
          
      </div>
    )
  }

}

export default WorkbookPageEditor;
