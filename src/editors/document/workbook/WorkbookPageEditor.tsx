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
import { Resource } from "../../../data/content/resource";
import { Linkable } from '../../../data/content/linkable';
import { LOTypes, LearningObjective } from '../../../data/content/los';
import { Collapse } from '../../content/common/Collapse';
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
  los: Array <Linkable>;
  annotations: Array <Linkable>;  
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState> {
    
  constructor(props) {
    super(props, {modalIsOpen: false, los: new Array()});

    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  componentDidMount() {              
    super.componentDidMount();              
    this.loadLearningObjectives ();
  }

  /**
   * 
   */
  loadLearningObjectives () : void {
     
    console.log ("loadLearningObjectives ()");  
      
    persistence.bulkFetchDocuments (this.props.context.courseId,["x-oli-learning_objectives"],"byTypes").then (loDocuments => {
      if (loDocuments.length!=0) {          
        var tempLOArray:Array<Linkable>=new Array ();
        var mergedAnnotations:Array<Linkable>=new Array ();

        for (let i=0;i<loDocuments.length;i++) {
          let loModel:models.LearningObjectiveModel=loDocuments [i].model as models.LearningObjectiveModel; 
          let loFlat:Array<Linkable>=models.LearningObjectiveModel.toFlat (loModel.los,new Array<Linkable>());            
          for (let j=0;j<loFlat.length;j++) {              
            tempLOArray.push (loFlat [j]);
          }  
        }
        
        this.setState ({los: tempLOArray}, () => {  
          // Map the objrefs from the serialized workbook page back to proper Linkable objects ...            
          let testIndex:number=0;  
            
          this.props.model.head.annotations.map ((annotation) => {            
            for(let k=0;k<tempLOArray.length;k++) {
              let testLO:Linkable=tempLOArray [k];
              if (testLO.id==annotation.id) {
               
                //console.log ("Found LO to map: " + JSON.stringify (testLO));
                let linkable:Linkable=new Linkable ();
                linkable.id=testLO.id;
                linkable.title=testLO.title;                      
                mergedAnnotations.push (linkable);
              }    
            }
             
            testIndex++;  
          });
            
          //console.log ("Assinging reconstituted LO Linkables:" + JSON.stringify (mergedAnnotations));  
         
          this.setState ({annotations: mergedAnnotations});
        });    
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

    console.log ("onEdit ()");  
      
    let model; 

    if (property === 'annotations') {
      const head = this.props.model.head.with({ annotations: content });    
      this.handleEdit(this.props.model.with({ head }));        
    } else {      
      model = this.props.model.with({ body: content });
      this.handleEdit(model);
    }
  }
    
  /**
   * 
   */
  closeModal (newAnnotations:any) {
    this.setState ({modalIsOpen: false},function () {
      this.setState ({annotations:newAnnotations}, () =>{  
       this.onEdit ("annotations",newAnnotations);
      });    
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
      return (<LearningObjectiveLinker title="Available Learning Objectives" closeModal={this.closeModal.bind (this)} sourceData={models.LearningObjectiveModel.toFlat (this.state.los,new Array<Linkable>())} modalIsOpen={this.state.modalIsOpen} targetAnnotations={this.state.annotations} />);
    } 
                   
    return (<LearningObjectiveLinker title="Error" errorMessage="No learning objectives available, did you create a Learning Objectives document?" closeModal={this.closeModal.bind (this)} sourceData={[]} modalIsOpen={this.state.modalIsOpen} targetAnnotations={this.props.model.head.annotations} />);           
  }
       
  render() {      
    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const lolinker = this.createLinkerDialog ();
    const testArray = this.state.annotations;  
    let addLearningObj;        
    let listItems; 
    let loDisplay      
    
    if (testArray) {  
      listItems = testArray.map(lo => <li>{lo.title}</li>); 
      loDisplay = (testArray as any).size === 0
        ? <p>No learning objectives currently linked</p>
        : <ul>{listItems}</ul>;
    }    

    addLearningObj = <button className="btn btn-link" onClick={e => { e.preventDefault(); this.linkLO (); }}>Edit Learning Objectives</button>


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
                
          
          {lolinker}        

          <Collapse 
            caption="Learning Objectives" 
            expanded={addLearningObj}>
            {loDisplay}
          </Collapse>

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
