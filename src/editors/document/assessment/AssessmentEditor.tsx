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
    super(props, ({} as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
  }

  onEdit(guid : string, content : models.Node) {
    const nodes = this.props.model.nodes.set(guid, content);
    this.handleEdit(this.props.model.with({nodes}));
  }

  onTitleEdit(content: contentTypes.Title) {
    this.handleEdit(this.props.model.with({title: content}));
  }

  renderNode(n : models.Node) {
    if (n.contentType === 'Question') {
      return <QuestionEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={(c) => this.onEdit(n.guid, c)} 
              />
              
    } else if (n.contentType === 'Content') {
      return <ContentEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={(c) => this.onEdit(n.guid, c)} 
              />
    } else {
      return <UnsupportedEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={(c) => this.onEdit(n.guid, c)} 
              />
    }
  }

  renderTitle() {
      return <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.title}
            onEdit={this.onTitleEdit} 
            />
  }

  onAddContent() {
    let content = new contentTypes.Content();
    content = content.with({guid: guid()});
    this.handleEdit(this.props.model.with({nodes: this.props.model.nodes.set(content.guid, content) }));
  }

  onAddQuestion() {
    let content = new contentTypes.Question();
    content = content.with({guid: guid()});
    this.handleEdit(this.props.model.with({nodes: this.props.model.nodes.set(content.guid, content) }));
  }

  render() {

    const titleEditor = this.renderTitle();
    const nodeEditors = this.props.model.nodes.toArray().map(n => this.renderNode(n));
    return (
      <div>
        <div className="docHead">
          <Toolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}
            onAddContent={this.onAddContent} onAddQuestion={this.onAddQuestion}/>
          {titleEditor}
          <button type="button" className="btn btn-secondary" onClick={this.onAddContent}>Add Content</button>
          <button type="button" className="btn btn-secondary" onClick={this.onAddQuestion}>Add Question</button>
        </div>
        {nodeEditors}
      </div>);
    
  }

}

export default AssessmentEditor;
