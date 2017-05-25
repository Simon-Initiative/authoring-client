'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { QuestionEditor } from '../../content/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { UnsupportedEditor } from '../../content/unsupported/UnsupportedEditor';
import { Toolbar } from './Toolbar';
import * as models from '../../../data/models';
import {Resource} from "../../../data/resource";
import * as contentTypes from '../../../data/contentTypes';
import guid from '../../../utils/guid';
import * as persistence from '../../../data/persistence';
import LearningObjectiveLinker from '../../../components/LinkerDialog';

interface AssessmentEditor {
  
}

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  
}

interface AssessmentEditorState extends AbstractEditorState {
  modalIsOpen : boolean;
  skillModel: models.SkillModel;
}

class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps, 
  AssessmentEditorState>  {

  constructor(props) {
    super(props, ({modalIsOpen: false, skillModel: new models.SkillModel} as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
  }

  componentDidMount() {                    
      console.log ("componentDidMount ()");
      
      this.loadSkills ();
  }     
    
  loadSkills () : void {
    console.log ("loadSkills ()");
            
    let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
  
    resourceList.map((value, id) => {        
      if (value.type=="x-oli-skills") {
        console.log ("Found skills document, loading ...");  
        persistence.retrieveDocument (this.props.context.courseId,id).then(skillDocument => 
        {
          console.log ("Loaded skill document, assinging ...");  
          let aSkillModel:models.SkillModel=skillDocument.model as models.SkillModel;   
          this.setState ({skillModel: aSkillModel.with (this.state.skillModel)});
        });
      }          
    })  
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

  /**
   * 
   */
  closeModal () {
    console.log ("closeModal ()");
        
    //this.saveToDB ();
  }     

  /**
   * 
   */
  onAddSkills() {        
    console.log ("onAddSkills ()");
                 
    this.setState ({modalIsOpen: true});
  }

  /**
   * 
   */
  createLinkerDialog () {           
    if (this.state.skillModel!=null) {            
      return (<LearningObjectiveLinker title="Available Skills" closeModal={this.closeModal.bind (this)} sourceData={this.state.skillModel.skills} modalIsOpen={this.state.modalIsOpen} target={new Object()} />);
    } else {
      console.log ("Internal error: skill model object can be empty but not null");
    }
                   
    return (<div></div>);           
  }  

  render() {

    const titleEditor = this.renderTitle();
    const nodeEditors = this.props.model.nodes.toArray().map(n => this.renderNode(n));
    const skilllinker = this.createLinkerDialog ();    
    
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
          <button type="button" className="btn btn-secondary" onClick={this.onAddSkills}>Add Skills</button>
        </div>
        {skilllinker} 
        {nodeEditors}
      </div>);
    
  }

}

export default AssessmentEditor;
