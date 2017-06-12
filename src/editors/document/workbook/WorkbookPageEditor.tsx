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
import { LOTypes, LearningObjective } from '../../../data/los';

import LearningObjectiveLinker from '../../../components/LinkerDialog';

import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';

import * as models from '../../../data/models';


const styles = {  
  loContainer : {
    "border": "1px solid grey",
    "background": "#ffffff",  
    "height": "125px",
    "overflowX": "auto",
    "overflowY": "scroll",
    "marginBottom" : "10px",
    "padding" : "4px"
  }
}

interface WorkbookPageEditor {
  
}

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  modalIsOpen : boolean;
  los: Array <LearningObjective>;
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState> {
    
  constructor(props) {
    super(props, {modalIsOpen: false, los: new Array()});

    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  componentDidMount() {                    
    this.loadLearningObjectives ();
  }        
    
  /*
  loadLearningObjectives () : void {
    this.props.context.courseModel.resources.map((value, id) => {        
      if (value.type=="x-oli-learning_objectives") {
        persistence.retrieveDocument (this.props.context.courseId,id).then(loDocument => 
        {
          //console.log ("LO document: " + JSON.stringify (loDocument));
          let loModel:models.LearningObjectiveModel=loDocument.model as models.LearningObjectiveModel;   
          this.setState ({los: loModel}, function () {
            //console.log ("Verify: " + JSON.stringify (this.state.los));    
          });
        });
      }          
    })  
  } 
  */
  
    /**
     * 
     */
    loadLearningObjectives () : void {
      //console.log ("loadLearningObjectives ()");

      persistence.bulkFetchDocuments (this.props.context.courseId,["x-oli-learning_objectives"],"byTypes").then (loDocuments => {
        if (loDocuments.length!=0) {  
          //console.log ("Retrieved " + loDocuments.length + " LO documents");

          var tempLOArray:Array<LearningObjective>=new Array ();  
            
          for (let i=0;i<loDocuments.length;i++) {
            let loModel:models.LearningObjectiveModel=loDocuments [i].model as models.LearningObjectiveModel;
              
            for (let j=0;j<loModel.los.length;j++) {
               //console.log ("Adding LO: " + loModel.los [j].title); 
               tempLOArray.push (loModel.los [j]); 
            }  
          }
            
          //console.log ("Compound LO data: " + JSON.stringify (tempLOArray));
            
          this.setState ({los: tempLOArray}, () => {  });
                    
        } else {
          console.log ("Error: no learning objectives retrieved!");  
        }         
      });   
    }   

  onTitleEdit(title) {
    const head = this.props.model.head.with({ title });
    this.handleEdit(this.props.model.with({ head }));
  }



  onEdit(property : string, content : any) {

    let model; 

    if (property === 'annotations') {
      const head = this.props.model.head.with({ annotations: content });
      model = this.props.model.with({ head });
        
    } else {      
      model = this.props.model.with({ body: content });
    }
     
    this.handleEdit(model);
  }
    
  /**
   * 
   */
  closeModal (newAnnotations:any) {
    this.setState ({modalIsOpen: false},function () {
      this.onEdit ("annotations",newAnnotations);
    });      
  }     

  /**
   * 
   */
  linkLO() {        
    this.setState ({modalIsOpen: true});
  }

  /**
   * 
   */
  createLinkerDialog () {           
    if (this.state.los!=null) {            
      return (<LearningObjectiveLinker title="Available Learning Objectives" closeModal={this.closeModal.bind (this)} sourceData={models.LearningObjectiveModel.toFlat (this.state.los,new Array<Linkable>())} modalIsOpen={this.state.modalIsOpen} targetAnnotations={this.props.model.head.annotations} />);
    } 
                   
    return (<LearningObjectiveLinker title="Error" errorMessage="No learning objectives available, did you create a Learning Objectives document?" closeModal={this.closeModal.bind (this)} sourceData={[]} modalIsOpen={this.state.modalIsOpen} targetAnnotations={this.props.model.head.annotations} />);           
  }
       
  render() {

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const lolinker = this.createLinkerDialog ();
    let testArray:Array<Linkable>=this.props.model.head.annotations;  
    const listItems = testArray.map((lo) =>      
       <li>{lo.title}</li>  
    ); 

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
            onEdit={this.onTitleEdit} 
            />
                
          <a className="btn btn-secondary" href="#" 
            onClick={e => this.linkLO ()}>+ Learning Objective</a>

          {lolinker}          
          <div style={styles.loContainer}>
            Linked Learning Objectives:<br/>
            <ul>{listItems}</ul>
          </div>
          
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
