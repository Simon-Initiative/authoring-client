import * as React from 'react';
import { PropTypes } from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

import {OrgContentTypes,IDRef,OrgItem,OrgSection,OrgSequence,OrgModule,OrgOrganization} from '../../../data/org'
import OrganizationNodeRenderer from './OrganizationNodeRenderer';
import LearningObjectiveLinker from '../../../components/LinkerDialog';

import { AppContext } from '../../common/AppContext';

const tempnavstyle=
{
    h2:
    {
        marginRight: '10px'
    }
};

interface OrganizationEditor 
{

}

export interface OrganizationEditorState extends AbstractEditorState 
{    
  treeData : any;  
  orgData: OrgOrganization;  
  modalIsOpen : boolean;
  model: any;
  context: AppContext;
  los: any;
  orgTarget : any;
  document: any;
  documentId: string;    
}

export interface OrganizationEditorProps extends AbstractEditorProps<models.CourseModel>
{
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;    
  context: AppContext;
}

/**
*
*/
class OrganizationEditor extends AbstractEditor<models.CourseModel,OrganizationEditorProps, OrganizationEditorState> 
{
    /**
     * 
     */
    constructor(props) {
      super(props, {
        treeData: [],
        orgData: [],
        context: props.context,
        los: null,
        orgTarget: null,
        documentId: props.context.documentId,
        model: props.model,
        document: {},                
        modalIsOpen: false    
      });
    }
        
    /**
     *
     */    
    componentDidMount() {                    
      console.log ("componentDidMount ()");
        persistence.retrieveDocument(this.state.context.courseId).then(course => {            
            let orgObject=course ["model"]["organizations"];                                    
            let orgDocId=orgObject.get (0);
           
            persistence.retrieveDocument(orgDocId).then(doc => {
              this.setState ({treeData: doc ["model"]["organization"],document: doc});
            }); 
            
            let loObject=course ["model"]["learningobjectives"];                                    
            let logDocId=loObject.get (0);
           
            persistence.retrieveDocument(logDocId).then(loDoc => {
              this.setState ({los: loDoc ["model"]["los"]});
            });              
        });        
    }
    
    /**
     *
     */            
    loadDocument (anID:string):any {
        console.log ("loadDocument ("+anID+")");

        persistence.retrieveDocument(anID).then(doc => {
            this.setState ({modalIsOpen: false, orgData: doc.model ["toplevel"], treeData: doc.model ["organization"],document: doc});
            return (doc);
        });

       return (null);         
    }
    
    saveToDB (newData?:any): void {

      var newModel=models.OrganizationModel.updateModel (this.state.orgData,this.state.treeData);
                     
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
     * 
     */
    processDataChange (newData: any) {
      console.log ("processDataChange ()");
                    
      this.saveToDB (newData);      
    }    
        
    /**
     * People might notice that this code is a bit odd because it will return
     * the last organization object under the root. Right now that is by design.
     * That might change as the specs change but at least we won't have to
     * redo the code.
     */
    /*
    static createEmtpyOrganization (aData:any) : OrgOrganization {
        
      var orgNode=new OrgOrganization ();// throw away for now
                       
      if (aData)
      {  
          for (var i in aData) { 
            orgNode=new OrgOrganization ();// throw away for now
            orgNode.id=aData [i]["@id"];
            orgNode.version=aData [i]["@version"];
            var oList=aData [i]["#array"];
                            
            if (i=='organization') {
              for (var k=0;k<oList.length;k++) {                   
                var obj=oList [k];                 
                                          
                for (var j in obj) {
                  var destNode = obj [j];
                                         
                  if (j=='title') {
                    orgNode.title=OrganizationEditor.getTextFromNode (destNode);
                  }
                    
                  if (j=='description') {
                    orgNode.description=OrganizationEditor.getTextFromNode (destNode);
                  }
                    
                  if (j=='audience') {
                    orgNode.audience=OrganizationEditor.getTextFromNode (destNode);
                  }                
                }
              }
            }                   
          }
      }   
        
      return (orgNode);
    }
    */  
    
    /**
     * 
     */
    /*
    static getTextFromNode (aNode: any) : string {
        
      console.log ("getTextFromNode: " + JSON.stringify (aNode));
          
      // Check for old style text nodes  
      if (aNode ['#text']) { 
        return (aNode ['#text']);
      } 

      return ("");
    }
    */
        
    /**
     * Here we go from visual data to database-ready data. We walk the tree
     * and build a db JSON ready representation. We could have done this
     * recursively but since we have to tag every level with a certain type
     * in output tree it was easier to do this in one function for now.
     */
    /*
    extractData (aData: any): Object {
        console.log ("extractData ()");
                
        //var newData=aData.treeData;
        var newData=aData;
                
        // First process our organization object and add it to the tree we're building
        
        let orgObject:OrgOrganization=this.state.orgData as OrgOrganization;
               
        let orgRoot:Object=orgObject.toJSONObject ();
        let seqRoot=new Object ();
        orgRoot ["organization"]["#array"].push (seqRoot);
        
        let sequences:Object=new Object ();
        seqRoot ["sequences"]=sequences;
                        
        // We can point directly to .children because we ensure in the constructor that 
        // this object always exists             
        for (let j=0;j<newData.length;j++)
        {            
          let seqObject:OrgSequence=newData [j] as OrgSequence;
                        
          //let sequence:Object=seqObject.toJSONObject (); // This doesn't work for some reason 
          let sequence:Object=new Object ();          
          sequence ["@id"]=seqObject.id;
          sequence ["@category"]=seqObject.category;
          sequence ["@audience"]=seqObject.audience;
          sequence ["#array"]=new Array ();
          sequence ["#array"].push (OrgItem.addTextObject ("title",seqObject.title));
              
          sequences["sequence"]=sequence;   
                        
          for (let k=0;k<seqObject.children.length;k++)
          {
            let mObj:OrgItem=seqObject.children [k];
                            
            // Check the type here. We can expect Module, Section and Item  
            console.log ("Object: " + mObj.orgType);
             
            let moduleContainer:Object=new Object ();
            let moduleObj:Object=new Object ();
            moduleContainer ["module"]=moduleObj;

            sequence ["#array"].push (moduleContainer);
             
            moduleObj["@id"]=mObj.id;
            moduleObj["#array"]=new Array ();
            moduleObj["#array"].push (OrgItem.addTextObject ("title",mObj.title));
  
            for (let l=0;l<mObj.children.length;l++)
            {
              console.log ("Section: " + mObj.children [l].title);
                
              let sObj:OrgItem=mObj.children [l];                
               
              let sectionObj:Object=new Object();               
              let sectionContainer:Object=new Object ();
              sectionContainer ["section"]=sectionObj;  
           
              moduleObj["#array"].push (sectionContainer);
               
              sectionObj ["#id"]=sObj.id; 
              sectionObj ["#array"]=new Array ();
              sectionObj ["#array"].push (OrgItem.addTextObject ("title",sObj.title));                   

              for (let m=0;m<sObj.children.length;m++)
              {
                let iObj=sObj.children [m];

                if (iObj.orgType==OrgContentTypes.Item)
                {
                   var itemObj:OrgItem=iObj as OrgItem; 
                   sectionObj ["#array"].push (iObj.toJSONObject ());   
                }
                else {
                    console.log ("Error: undefined type found at this level: " + iObj.orgType);
                }    
              }
            }
          }
        }
        
        var formattedOrganization=JSON.stringify (orgRoot);        
        console.log ("To: " + formattedOrganization);
        
        return (orgRoot);
    }
    */
    
    /**
     * 
     */
    /*
    resolveItem (anItem:any):string {
        
        return ("");
    }
    */
    
    /**
     * This method is called by the tree component and even though we could access
     * the state directly we're going to assume that the tree component made some
     * changes that haven't been reflected in the global component state yet.
     */
    /*
    processDataChange (newData: any) {
                
        console.log ("processDataChange ()");
        
        this.extractData (newData);        
        
        this.setState (newData);                
    }
    */

    /**
     * 
     */
    expand(expanded) {
        this.setState({
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
     * Note that this manual method of adding a new node does not generate an
     * onChange event. That's why we call extractData manually as the very
     * last function call.
     */
    addNode (anEvent) {
        //console.log ("addNode ()");
        
        var immutableHelper = this.state.treeData.slice()
        
        //var aData=this.state.treeData;

        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode:OrgSequence=new OrgSequence ();
        newNode.title="New Sequence";
        immutableHelper.push (newNode);

        /*
        this.extractData (immutableHelper);
        
        this.setState({treeData: immutableHelper});
        */
        
        this.setState({
          modalIsOpen : false, 
          treeData: immutableHelper
        },function (){
          this.saveToDB ();
        });
    }    

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
          
        let immutableHelper = this.state.treeData.slice();
        
        console.log ("Tree: " + JSON.stringify (immutableHelper));
        
        let parentArray:Array<Object>=this.findTreeParent (immutableHelper,aNode);
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
        
        if (parentArray!=null) {
            console.log ("We have an object, performing edit ...");
        }
        else {
           console.log ("Internal error: node not found in tree");
        }        
                        
        for (var i=0;i<parentArray.length;i++) {
            let testNode:OrgItem=parentArray [i] as OrgItem;
            
            if (testNode.id==aNode.id) {
                parentArray.splice (i,1);
                break;
            }
        }
        
        this.setState({treeData: immutableHelper});        
    }
        
    /**
     * 
     */    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("OrganizationEditorr:editTitle ()");
                
        let newTitle=aTitle.text;
        let immutableHelper = this.state.treeData.slice();
        
        console.log ("Tree: " + JSON.stringify (immutableHelper));
        
        let parentArray:Array<Object>=this.findTreeParent (immutableHelper,aNode);
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
        
        if (parentArray!=null) {
            console.log ("We have an object, performing edit ...");
        }
        else {
           console.log ("Internal error: node not found in tree");
        }
                    
        for (var i=0;i<parentArray.length;i++) {
            let testNode:OrgItem=parentArray [i] as OrgItem;
            
            if (testNode.id==aNode.id) {
                testNode.title=newTitle;
                break;
            }
        }
        
        this.setState({treeData: immutableHelper});
    }
    
    /**
     * 
     */    
    genProps () {
        console.log ("OrganizationEditor:genProps ()");
        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);

        return (optionalProps);
    }
    
    /**
     * 
     */
    closeModal () {
      console.log ("LearningObjectiveEditor: closeModal ()");
        
      //this.saveToDB ();  
    }    
    
    /**
     * 
     */
    createLinkerDialog () {           
      if (this.state.los!=null) {            
        return (<LearningObjectiveLinker closeModal={this.closeModal.bind (this)} sourceData={this.state.los} modalIsOpen={this.state.modalIsOpen} loTarget={this.state.orgTarget} />);
      } else {
        console.log ("Internal error: no skills object can be empty but not null");
      }
                   
      return (<div></div>);           
    }
            
    /**
     * 
     */
    render() 
    { 
      //console.log ("render()");
      
      const lolinker=this.createLinkerDialog ();  
        
      return (
              <div>
                  <div>
                      <h2 className="h2 organize" style={tempnavstyle.h2}>Course Content</h2>
                      <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                      <a className="btn btn-secondary" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                      <a className="btn btn-secondary" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                  </div>
                  {lolinker}
                  <SortableTree
                      maxDepth={5}
                      treeData={this.state.treeData}
                      //generateNodeProps={rowInfo => ({ onClick: () => console.log("rowInfo onClick ()") })}
                      onChange={ treeData => this.processDataChange({treeData}) }
                      nodeContentRenderer={OrganizationNodeRenderer}
                      generateNodeProps={this.genProps.bind(this)} 
                  />
              </div>
      );
    }
}

export default OrganizationEditor;
