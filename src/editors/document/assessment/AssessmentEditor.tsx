'use strict'

import * as React from 'react';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { QuestionEditor } from '../../content/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { UnsupportedEditor } from '../../content/unsupported/UnsupportedEditor';

import * as models from '../../../data/models';

interface AssessmentEditor {
  
}

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  
}

interface AssessmentEditorState extends AbstractEditorState {
  
}

class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps, 
  AssessmentEditorState>  {

  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };
  }

  onEdit(guid : string, content : models.Node) {
    const nodes = this.props.model.nodes.set(guid, content);
    this.props.onEdit(this.props.model.with({nodes}));
  }

  renderNode(n : models.Node) {
    if (n.contentType === 'Question') {
      return <QuestionEditor
              key={n.guid}
              documentId={this.props.documentId}
              courseId={this.props.model.courseId}
              activeSubEditorKey={this.props.activeSubEditorKey}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              model={n}
              onEdit={(c) => this.onEdit(n.guid, c)} 
              editingAllowed={this.props.editingAllowed}/>
              
    } else if (n.contentType === 'Content') {
      return <ContentEditor
              key={n.guid}
              documentId={this.props.documentId}
              courseId={this.props.model.courseId}
              activeSubEditorKey={this.props.activeSubEditorKey}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              model={n}
              onEdit={(c) => this.onEdit(n.guid, c)} 
              editingAllowed={this.props.editingAllowed}/>
    } else {
      return <UnsupportedEditor
              key={n.guid}
              documentId={this.props.documentId}
              courseId={this.props.model.courseId}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              model={n}
              onEdit={(c) => this.onEdit(n.guid, c)} 
              editingAllowed={this.props.editingAllowed}/>
    }
  }

  render() {
    
    let nodeEditors = this.props.model.nodes.toArray().map(n => this.renderNode(n));
    return <div>{nodeEditors}</div>;
    
  }

}

export default AssessmentEditor;
