'use strict'

import * as React from 'react';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { QuestionEditor } from '../../content/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { UnsupportedEditor } from '../../content/unsupported/UnsupportedEditor';
import { Toolbar } from './Toolbar';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import guid from '../../../utils/guid';

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

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
  }

  onEdit(guid : string, content : models.Node) {
    const nodes = this.props.model.nodes.set(guid, content);
    this.props.onEdit(this.props.model.with({nodes}));
  }

  onTitleEdit(content: contentTypes.Title) {
    this.props.onEdit(this.props.model.with({title: content}));
  }

  renderNode(n : models.Node) {
    if (n.contentType === 'Question') {
      return <QuestionEditor
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
              
    } else if (n.contentType === 'Content') {
      return <ContentEditor
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

  renderTitle() {
      return <TitleContentEditor 
            services={this.props.services}
            userId={this.props.userId}
            documentId={this.props.documentId}
            courseId={this.props.model.courseId}
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            model={this.props.model.title}
            onEdit={this.onTitleEdit} 
            editingAllowed={this.props.editingAllowed}/>
  }

  onAddContent() {
    let content = new contentTypes.Content();
    content = content.with({guid: guid()});
    this.props.onEdit(this.props.model.with({nodes: this.props.model.nodes.set(content.guid, content) }));
  }

  onAddQuestion() {
    let content = new contentTypes.Question();
    content = content.with({guid: guid()});
    this.props.onEdit(this.props.model.with({nodes: this.props.model.nodes.set(content.guid, content) }));
  }

  render() {
    
    const titleEditor = this.renderTitle();
    const nodeEditors = this.props.model.nodes.toArray().map(n => this.renderNode(n));
    return (
      <div>
        {titleEditor}
        {nodeEditors}
        <hr/>
        <Toolbar onAddContent={this.onAddContent} onAddQuestion={this.onAddQuestion}/>
      </div>);
    
  }

}

export default AssessmentEditor;
