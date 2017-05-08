import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { LOTypes, LearningObjective } from '../../../data/los';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

import { OrgItem } from '../organization/OrganizationTypes';
import LONodeRenderer from './LONodeRenderer';
import LearningObjectiveLinker from './LearningObjectiveLinker';
import { AppContext } from '../../common/AppContext';

//var loData=require ('./LO.json');

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
  loTarget : any;
  document: any;
  documentId: string;
}

export interface LearningObjectiveEditorProps extends AbstractEditorProps<models.CourseModel> {
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;    
  context: AppContext;
}

/**
*
*/
class LearningObjectiveEditor extends AbstractEditor<models.CourseModel,LearningObjectiveEditorProps, LearningObjectiveEditorState> {

    /**
     * 
     */
    constructor(props) {
        console.log ("LearningObjectiveEditor ()");
        
        /*    
        super(props, {
                        model: {},    
                        treeData: LearningObjectiveEditor.processData (loData),
                        rootLO: LearningObjectiveEditor.createRootLO (loData),
                        modalIsOpen : false,
                        context: props.context,
                        skills: null,
                        loTarget: null
                     });
        */
        super(props, {
                        treeData: [],    
                        context: props.context,
                        skills: null,
                        loTarget: null,
                        documentId: props.context.documentId,
                        model: props.model,
                        document: {},
                        modalIsOpen: false                      
                     });                        
    }

    /**
     *
     */               
    /*        
    componentDidMount () {
        console.log ("componentDidMount ("+this.state.documentId+")");
        
        this.loadDocument(this.state.documentId);
    }
    */
            
    componentDidMount() {                    
      console.log ("componentDidMount ()");
        persistence.retrieveDocument(this.state.context.courseId).then(course => {            
            let loObject=course ["model"]["learningobjectives"];                                    
            let loDocId=loObject.get (0);
           
            persistence.retrieveDocument(loDocId).then(doc => {
              //this.setState ({treeData: this.processData (skillsDoc ["model"]["los"])});
              this.setState ({treeData: doc ["model"]["los"],document: doc});
            }); 
            
            let skillObject=course ["model"]["skills"];                                    
            let skillDocId=skillObject.get (0);
           
            persistence.retrieveDocument(skillDocId).then(skillDoc => {
              this.setState ({skills: skillDoc ["model"]["skills"]});
            });              
        });        
    }              

    /**
     *
     */            
    loadDocument (anID:string):any {
        console.log ("loadDocument ("+anID+")");

        /*
        persistence.retrieveDocument(anID).then(course => {
            console.log ("course: " + JSON.stringify (course));
            
            let loObject=course ["model"]["los"];
                                    
            let loDocId=loObject.get (0);
           
            persistence.retrieveDocument(loDocId).then(doc => {
              this.setState ({treeData: doc ["model"]["los"],document: doc});
              return (doc);
            });    
        }); 

       return (null);
       */
        
        console.log ("loadDocument ("+anID+")");

        persistence.retrieveDocument(anID).then(doc => {
            this.setState ({modalIsOpen: false, treeData: doc.model ["los"],document: doc});
            return (doc);
        });

       return (null);         
    }             
       
    /**
     *
     */      
    componentWillReceiveProps(nextProps) {
        console.log ("componentWillReceiveProps ();");    
    }    
    
    /**
     *
     */     
    /*       
    static createRootLO (aData: any):Object {
        
        var newRootLO:LearningObjective=new LearningObjective ();
        
        for (var i in aData) {
            
            if (i=="objectives") {                
                var loRoot=aData [i];
                newRootLO.id=loRoot ["@id"];
                
                for (var j=0;j<loRoot ["#array"].length;j++) {
                    var lObjectiveTest=loRoot ["#array"][j];
                    
                    for (var k in lObjectiveTest) {
                        if (k=="title") {
                            newRootLO.title= LearningObjectiveEditor.getTextFromNode (lObjectiveTest [k]);                            
                        }
                    }
                }
            }
        }  
        
        return (newRootLO as Object);
    }
    */

    /**
     * 
     */
    processDataChange (newData: any) {
      console.log ("processDataChange ()");
        
      /*
      this.reparent ();  
              
      this.extractData (newData);        
        
      this.setState (newData);
      */
            
      this.saveToDB ();      
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
    /*
    extractData (aData: Array<LearningObjective>): Object {
        console.log ("extractData ()");
                                
        console.log ("From: " + JSON.stringify (aData));         
        
        var newData:Object=new Object ();
        newData ["objectives"]=new Object();
        newData ["objectives"]["@id"]=this.state.model.id;
        newData ["objectives"]["#array"]=new Array ();
        newData ["objectives"]["#array"].push (OrgItem.addTextObject ("title",this.state.model.title));
        
        for (var i=0;i<aData.length;i++)               
        {
            var testLOContainer:Object=new Object();
            
            var ephemeral:Object=new Object ();
              
            ephemeral ["@id"]=aData [i].id;
            ephemeral ["@category"]=aData [i].category;
            ephemeral ["#text"]=aData [i].title;
        
            // Add all the annotations of type skill to the skill list. Currently
            // we do not define a type on annotations so for now we will assume
            // that all annotations are skills
        
            ephemeral ["#skills"]=new Array<string>();
                          
            for (var j=0;j<aData [i].annotations.length;j++) {
              
              ephemeral ["#skills"].push (aData [i].annotations [j].id);
            }            
            
            newData ["objectives"]["#array"].push (ephemeral);
        }
       
        console.log ("To: " + JSON.stringify (newData));
        
        return (newData);
    }
    */
    
    /**
     *
     */
    /*
    saveToDB (): void {
        //console.log ("saveToDB ()");
        
        let immutableDocument = this.state.document;
        
        if (immutableDocument==null)
        {
            console.log ("immutableDocument is null, bump");
            return;
        }

        var extractedData:any=this.extractData (this.state.treeData);
        
        //console.log ("extractedData: " + JSON.stringify (extractedData));
                
        // Keep in mind that extractData creates a skills object, but in our
        // model we already have one so we need to extract the contents from
        // inside that object. Bit confusing prehaps but we'll clean it up
        // later.
        var newModel=models.LearningObjectiveModel.updateModel (extractedData);
                 
        var updatedDocument=this.state.document.set ('model',newModel);
        
        //console.log ("updatedDocument: " + JSON.stringify (updatedDocument));
               
        this.setState ({'document' : updatedDocument },function () {         
          persistence.persistDocument(this.state.document)
            .then(result => {
                console.log ("Document saved, loading to get new revision ... ");                
                this.loadDocument (this.state.documentId);
            });
        }); 
    }
    */

    saveToDB (): void {
        //console.log ("saveToDB ()");

        var newModel=models.LearningObjectiveModel.updateModel (this.state.treeData);
                 
        var updatedDocument=this.state.document.set ('model',newModel);
                       
        this.setState ({'document' : updatedDocument },function () {         
          persistence.persistDocument(this.state.document)
            .then(result => {
                console.log ("Document saved, loading to get new revision ... ");                
                this.loadDocument (this.state.documentId);
            });
        }); 
    }    
    
    /**
     * This method goes from external format to the format used by the tree renderer
     * Note that the tree widget needs to maintain any attributes we add to a node
     * object. Otherwise we can't annotate and enrich the structuer. 
     */
    /*
    processData (treeData: any) {
      console.log ("processData ()");    
    
      var newData:Array<Object>=new Array ();
                
      for (var i in treeData) {
            
        if (i=="objectives") {                
          var loRoot=treeData [i];
                
          for (var j=0;j<loRoot ["#array"].length;j++) {
            var lObjectiveTest=loRoot ["#array"][j];
                    
            for (var k in lObjectiveTest) {
                        
            if (k=="objective") {
              newData.push (LearningObjectiveEditor.parseLearningObjective (lObjectiveTest [k]));                            
              }                        
            }
          }
        }
      }
      return (newData);
    }
    */
    
    /**
     * Note that this manual method of adding a new node does not generate an
     * onChange event. That's why we call extractData manually as the very
     * last function call.
     */
    addNode (anEvent) {
        
        console.log ("addNode ()");
                
        var immutableHelper = this.state.treeData.slice()
        
        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode:LearningObjective=new LearningObjective ();
        newNode.title="New Learning Objective";
        immutableHelper.push (newNode);

        //this.extractData (immutableHelper);
        
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
    deleteNode (aNode:any): void {
        console.log ("LearningObjectiveEditor:deleteNode ()");
            
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
                
        for (var i=0;i<immutableHelper.length;i++) {
            let testNode:LearningObjective=immutableHelper [i];
            
            if (testNode.id==aNode.id) {
                immutableHelper.splice (i,1);
                break;
            }
        }
        
        this.setState({modalIsOpen: false,treeData: immutableHelper});
    }
    
    /**
     * 
     */    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("LearningObjectiveEditor:editTitle ()");
        
        //let newTitle=aTitle.title.get ("#text");
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
        
        this.setState({modalIsOpen: false,treeData: immutableHelper});    
    }
    
    /**
     * 
     */
    linkSkill(aNode:any) {        
        console.log ("LearningObjectiveEditor:linkSkill ()");
        console.log ("aNode: " + JSON.stringify (aNode));
                
        this.setState ({modalIsOpen: true, loTarget: aNode});
    }
    
    /**
     * 
     */    
    genProps () {
        //console.log ("LearningObjectiveEditor:genProps ()");
        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["linkSkill"]=this.linkSkill.bind (this);
        optionalProps ["treeData"]=this.state.treeData;

        return (optionalProps);
    }
    
    /**
     * 
     */
    closeModal () {
      console.log ("LearningObjectiveEditor: closeModal ()");
        
      this.saveToDB ();  
    }
    
    /**
     * 
     */
    createLinkerDialog () {           
      if (this.state.skills!=null) {            
        return (<LearningObjectiveLinker closeModal={this.closeModal.bind (this)} sourceData={this.state.skills} modalIsOpen={this.state.modalIsOpen} loTarget={this.state.loTarget} />);
      } else {
        console.log ("Internal error: no skills object can be empty but not null");
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
                        <a className="nav-link" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                        <a className="nav-link" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
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
