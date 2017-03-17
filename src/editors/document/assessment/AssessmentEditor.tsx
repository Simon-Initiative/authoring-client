'use strict'

import * as React from 'react';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { InlineAssessmentContentEditor } from '../../content/inline/InlineAssessmentContentEditor';

import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import Toolbar from '../workbook/Toolbar';

import * as models from '../../../data/models';

interface AssessmentEditor {
  
}

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  
}

interface AssessmentEditorState extends AbstractEditorState {
  editHistory: AuthoringActions[];
}

class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps, 
  AssessmentEditorState> 
  implements  AuthoringActionsHandler {

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

    let changeRequest = (model: models.AssessmentModel) => 
      model.with(update);
      
    this.props.onEdit(changeRequest);
  }

  render() {

    const locked = this.props.editingAllowed === null || this.props.editingAllowed === false;
    const inlineToolbar = <Toolbar 
              courseId={this.props.model.courseId}
              services={this.props.services} 
              actionHandler={this} />;
    const blockToolbar = <Toolbar 
              courseId={this.props.model.courseId}
              services={this.props.services} 
              actionHandler={this} />;

    return (
      <div>
          <TitleContentEditor 
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            content={this.props.model.title}
            onEdit={(c) => this.onEdit('title', c)} 
            editingAllowed={this.props.editingAllowed}/>
          
          <HtmlContentEditor 
            inlineToolbar={inlineToolbar}
            blockToolbar={blockToolbar}
            activeSubEditorKey={this.props.activeSubEditorKey}
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            services={this.props.services}
            userId={this.props.userId}
            editHistory={this.state.editHistory}
            content={this.props.model.context}
            onEdit={(c) => this.onEdit('context', c)} 
            editingAllowed={this.props.editingAllowed}>
          </HtmlContentEditor>

          <InlineAssessmentContentEditor 
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            content={this.props.model.assessment}
            onEdit={(c) => this.onEdit('assessment', c)} 
            editingAllowed={this.props.editingAllowed}/>
      </div>
                
    )
  }

}

export default AssessmentEditor;
