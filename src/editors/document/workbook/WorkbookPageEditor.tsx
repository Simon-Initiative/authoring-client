'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import InlineToolbar  from './InlineToolbar';
import BlockToolbar  from './BlockToolbar';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import * as persistence from '../../../data/persistence';
import {Resource} from "../../../data/resource";
import Linkable from '../../../data/linkable';

import LearningObjectiveLinker from '../../../components/LinkerDialog';

import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';

import * as models from '../../../data/models';


interface WorkbookPageEditor {
  
}

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  modalIsOpen : boolean;
  los: models.LearningObjectiveModel;  
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState> {
    
  constructor(props) {
    super(props, {modalIsOpen: false, los: new Array()});
  }

  componentDidMount() {                    
      console.log ("componentDidMount ()");
      
      this.loadLearningObjectives ();
  }        
    
  loadLearningObjectives () : void {
    console.log ("loadLearningObjectives ()");
            
    let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
  
    resourceList.map((value, id) => {        
      if (value.type=="x-oli-learning_objectives") {
        persistence.retrieveDocument (this.props.context.courseId,id).then(loDocument => 
        {
          console.log ("LO document: " + JSON.stringify (loDocument));
          let loModel:models.LearningObjectiveModel=loDocument.model as models.LearningObjectiveModel;   
          this.setState ({los: loModel}, function () {
            //console.log ("Verify: " + JSON.stringify (this.state.los));    
          });
        });
      }          
    })  
  }  

  onEdit(property : string, content : any) {

    let model; 

    if (property === 'title') {
      const head = this.props.model.head.with({ title: content });
      model = this.props.model.with({ head });
        
    } else {
      model = this.props.model.with({ body: content });
    }
      
    this.handleEdit(model);
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
  linkLO() {        
    console.log ("linkLO ()");
                 
    this.setState ({modalIsOpen: true});
  }
       
  /**
   * We need to move this to a utility class because there are different instances
   * of it 
   */
  toFlat (aTree:Array<Linkable>, aToList:Array<Linkable>) : Array<Linkable>{
    console.log ("toFlat ()");
       
    if (!aTree) {
      return [];
    }  
        
    for (let i=0;i<aTree.length;i++) {
      let newObj:Linkable=new Linkable ();
      newObj.id=aTree [i].id;
      newObj.title=aTree [i].title;
      aToList.push (newObj);
          
      if (aTree [i]["children"]) {
        console.log ("Lo has children, processing ...");  
        let tList=aTree [i]["children"];
        this.toFlat (tList,aToList);
      }
    }
        
    return (aToList);  
  }    
    
  /**
   * 
   */
  createLinkerDialog () {           
    if (this.state.los!=null) {            
      return (<LearningObjectiveLinker title="Available Learning Objectives" closeModal={this.closeModal.bind (this)} sourceData={this.toFlat (this.state.los.los,new Array<Linkable>())} modalIsOpen={this.state.modalIsOpen} targetAnnotations={this.props.model.head.annotations} />);
    } else {
      console.log ("Internal error: learning objectives object can be empty but not null");
    }
                   
    return (<div></div>);           
  }    
    
  render() {

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const lolinker = this.createLinkerDialog ();    

    return (
      <div>
          <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
          <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.head.title}
            onEdit={c => this.onEdit('title', c)} 
            />
                
          <a className="btn btn-secondary" href="#" onClick={e => this.linkLO ()}>+ Learning Objective</a>

          {lolinker}              
          
          <HtmlContentEditor 
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={this.props.model.body}
              onEdit={c => this.onEdit('body', c)} 
              />
      </div>
    );
  }

}

export default WorkbookPageEditor;
