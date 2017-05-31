import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import {Resource} from "../../../data/resource";
import { LOTypes, LearningObjective } from '../../../data/los';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

import {OrgContentTypes,IDRef,OrgItem,OrgSection,OrgSequence,OrgModule,OrgOrganization} from '../../../data/org';
import LONodeRenderer from './LONodeRenderer';
import LearningObjectiveLinker from '../../../components/LinkerDialog';
import { AppContext } from '../../common/AppContext';

const tempnavstyle= {
    h2: {
        marginRight: '10px'
    }
};

interface LearningObjectiveEditor {

}

export interface LearningObjectiveEditorState extends AbstractEditorState {
  treeData : any;  
  modalIsOpen : boolean;
  model: any;
  context: AppContext;
  skills: any;
  target : any;
  document: any;
  documentId: string;
  titleIndex:number; 
}

export interface LearningObjectiveEditorProps extends AbstractEditorProps<models.LearningObjectiveModel> {
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;    
  context: AppContext;
}

/**
*
*/
class LearningObjectiveEditor extends AbstractEditor<models.LearningObjectiveModel,LearningObjectiveEditorProps, LearningObjectiveEditorState> {

    /**
     * 
     */
    constructor(props) {
        console.log ("LearningObjectiveEditor ()");
        
        super(props, {
                        treeData: [],    
                        context: props.context,
                        skills: null,
                        target: null,
                        documentId: props.context.documentId,
                        model: props.model,
                        document: {},
                        modalIsOpen: false,
                        titleIndex: 0                      
                     });                        
    }
  
    /**
     *
     */    
    componentDidMount() {                    
      console.log ("componentDidMount ()");
      let docu = new persistence.Document({
        _courseId: this.props.context.courseId,
        _id: this.props.model.guid,
        model: this.props.model
      });
                
      this.setState({treeData: this.props.model.los, document: docu}, function (){
        let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
          
        resourceList.map((value, id) => {          
          if (value.type=="x-oli-skills_model") {
            persistence.retrieveDocument (this.props.context.courseId,id).then(skillDocument => 
            {
              let skillModel:models.SkillModel=skillDocument.model as models.SkillModel;   
              this.setState ({skills: skillModel.skills});                  
            });
          }          
        })            
      });
    }              

     /**
     * This method is called by the tree component and even though we could access
     * the state directly we're going to assume that the tree component made some
     * changes that haven't been reflected in the global component state yet.
     */
    processDataChange (newData: any) {
      console.log ("processDataChange ()");
      console.log ("New data: " + JSON.stringify (newData));
                    
      this.saveToDB (newData);      
    }

    /**
     * 
     */
    expand(expanded) {
      this.setState({
         modalIsOpen : false,
         treeData: toggleExpandedForAll({
           treeData: this.state.treeData,                
           expanded,
         }),
      });
    }

    /**
     * 
     */
    expandAll() {
        this.expand(true);
    }

    /**
     * 
     */
    collapseAll() {
        this.expand(false);
    }
    
    /**
     * 
     */
    static getTextFromNode (aNode: any) : string {
        
      console.log ("getTextFromNode: " + JSON.stringify (aNode));
          
      // Check for old style text nodes  
      if (aNode ['#text']) { 
        return (aNode ['#text']);
      } 

      return ("");
    }
 
    /**
     * 
     */
    assignParent (aLOObject:LearningObjective,anId:string):void {
      console.log ("assignParent ()");

      aLOObject.parent=anId;

      for (let i=0;i<aLOObject.children.length;i++) {
        let loHelper=aLOObject.children [i];

        this.assignParent(loHelper,aLOObject.id);
      }
    }

    /**
     * 
     */
    assignParents (newData:any):void {    
      let immutableHelper = this.state.treeData.slice();

      if (newData) {
        console.log ("We have alternative facts, let's use those instead ...");
        
        if (newData ["treeData"]) {
         immutableHelper=newData ["treeData"];
        } else {  
         immutableHelper=newData;
        }    
      }
        
      if (immutableHelper==null)
      {
        console.log ("Bump");
        return;
      }

      console.log ("assignParents ("+immutableHelper.length+")");

      for (let i=0;i<immutableHelper.length;i++) {
        this.assignParent(immutableHelper [i],"");
      }

      return (immutableHelper);      
    }

    /**
     * 
     */
    saveToDB (newData?:any): void {
        console.log ("saveToDB ()");
        
        this.onEdit (newData);     
    }    
    
    /**
     * 
     */
    onEdit(newData?:any) {
      console.log ("onEdit ()");  
        
      let newModel  
  
      if (newData) {
        newModel=models.LearningObjectiveModel.updateModel (this.state.model,newData.treeData);
      } else {
        newModel=models.LearningObjectiveModel.updateModel (this.state.model,this.state.treeData);
      }  

      /*        
      if (newData) {
        newModel=this.state.model.with ({'los': newData});
      }    
      else {
        newModel=this.state.model.with ({'los': this.state.treeData});
      } 
      */   
      
      console.log ("Giving the following model to this.props.onEdit: " + JSON.stringify (newModel));  
        
      //this.props.onEdit(newModel); 
        
      this.setState ({modalIsOpen: false, treeData: newModel.los});  
    }     
        
    /**
     * Note that this manual method of adding a new node does not generate an
     * onChange event. That's why we call extractData manually as the very
     * last function call.
     */
    addNode (anEvent) {
        
        console.log ("addNode ()");
                
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode:LearningObjective=new LearningObjective ();
        newNode.title=("Title " + this.state.titleIndex);
        immutableHelper.push (newNode);
        
        this.setState ({titleIndex: this.state.titleIndex+1});
        
        this.setState({
          modalIsOpen : false, 
          treeData: immutableHelper
        },function (){
          this.saveToDB ();
        });   
    }
    
    /**
     * 
     */
    findTreeParent (aTree:any,aNode:any) : Array<Object> {
      console.log ("findTreeParent ("+aNode.id+")");
        
      for (var i=0;i<aTree.length;i++) {
        let testNode:OrgItem=aTree [i];
            
        if (testNode.id==aNode.id) {
         return (aTree);
        }
            
        // We can test length here because we always make sure this object exists
        if (testNode.children.length>0) {
          let result:Array<Object>=this.findTreeParent (testNode.children,aNode);
                
          if (result!=null) {
            return (result);
          }
        }
      }
        
      return (null);
    }     
    
    /**
     * 
     */    
    deleteNode (aNode:any): void {
        console.log ("LearningObjectiveEditor:deleteNode ()");
            
        var immutableHelper = this.state.treeData.slice();
        
        let parentArray:Array<Object>=this.findTreeParent (immutableHelper,aNode);
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
        
        for (var i=0;i<parentArray.length;i++) {
            let testNode:OrgItem=parentArray [i] as OrgItem;
            
            if (testNode.id==aNode.id) {
                parentArray.splice (i,1);
                break;
            }
        }
        
        this.saveToDB (immutableHelper);
    }
    
    /**
     * 
     */    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("LearningObjectiveEditor:editTitle ()");

        let newTitle=aTitle.text;
            
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
                
        for (var i=0;i<immutableHelper.length;i++) {
            let testNode:LearningObjective=immutableHelper [i];
            
            if (testNode.id==aNode.id) {
                testNode.title=newTitle;
                break;
            }
        }
        
        this.saveToDB (immutableHelper);
    }
    
    /**
     * 
     */
    linkSkill(aNode:any) {        
        console.log ("linkSkill ()");
                
        this.setState ({modalIsOpen: true, target: aNode});
    }
    
    /**
     * 
     */    
    genProps () {        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["linkAnnotation"]=this.linkSkill.bind (this);
        optionalProps ["treeData"]=this.state.treeData;

        return (optionalProps);
    }
    
    /**
     * 
     */
    closeModal (newAnnotations:any) {
        
      var immutableHelper = this.state.treeData.slice();
        
      let parentArray:Array<Object>=this.findTreeParent (immutableHelper,this.state.target);
        
      if (immutableHelper==null) {
        console.log ("Bump");
        return;
      }
       
      for (var i=0;i<parentArray.length;i++) {
        let testNode:OrgItem=parentArray [i] as OrgItem;
            
        if (testNode.id==this.state.target.id) {
          testNode.annotations=newAnnotations;      
          break;
        }
      }
        
      this.setState ({modalIsOpen: false, treeData: immutableHelper},function (){
        this.saveToDB ();    
      });
    }
    
    /**
     * 
     */
    createLinkerDialog () {
      if (this.state.target) {             
        if (this.state.skills){            
          return (<LearningObjectiveLinker title="Available Learning Skills" closeModal={this.closeModal.bind (this)} sourceData={this.state.skills} modalIsOpen={this.state.modalIsOpen} targetAnnotations={this.state.target.annotations} />);
        } else {
          console.log ("Internal error: skills object can be empty but not null");
        }
      } else {
        console.log ("No target yet.");
      }    
                   
      return (<div></div>);           
    }

    /**
     * 
     */
    render() {        
        const skilllinker=this.createLinkerDialog ();          
        
        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Learning Objectives</p>
                        <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                        <a className="nav-link" style={{"outline": "none"}} href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                        <a className="nav-link" style={{"outline": "none"}} href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                    </nav>
                   {skilllinker}
                    <SortableTree
                        maxDepth={3}
                        treeData={this.state.treeData}
                        onChange={ treeData => this.processDataChange({treeData}) }                        
                        nodeContentRenderer={LONodeRenderer}
                        generateNodeProps={this.genProps.bind(this)}
                    />
                </div>
        );
    }
}

export default LearningObjectiveEditor;
