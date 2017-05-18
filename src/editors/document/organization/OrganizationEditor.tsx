import * as React from 'react';
import { PropTypes } from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import Linkable from '../../../data/linkable';
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
  titleIndex:number;    
}

export interface OrganizationEditorProps extends AbstractEditorProps<models.OrganizationModel>
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
class OrganizationEditor extends AbstractEditor<models.OrganizationModel,OrganizationEditorProps, OrganizationEditorState>
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
        modalIsOpen: false,
        titleIndex: 0
      });  
    }
        
    /**
     *
     */    
    componentDidMount() {                    
      console.log ("componentDidMount ()");
      console.log("componentDidMount () " + JSON.stringify(this.props.model.toplevel));
      console.log("componentDidMount2 () " + JSON.stringify(this.props.model.organization));
      let docu = new persistence.Document({
        _courseId: this.props.context.courseId,
        _id: this.props.model.guid,
        model: this.props.model
      });
      this.setState({orgData: this.props.model.toplevel, treeData: this.props.model.organization, document: docu});
      //   persistence.retrieveDocument(this.state.context.courseId).then(course => {
      //       console.log ("course: " + JSON.stringify (course));
      //       let orgObject=course ["model"]["organizations"];
      //       let orgDocId=orgObject.get (0);
      //
      //       persistence.retrieveDocument(orgDocId).then(doc => {
      //         //console.log ("Org data: " + JSON.stringify (doc ["model"]));
      //
      //         this.setState ({orgData:doc ["model"]["toplevel"], treeData: doc ["model"]["organization"],document: doc});
      //       });
      //
      //       let loObject=course ["model"]["learningobjectives"];
      //       let logDocId=loObject.get (0);
      //
      //       persistence.retrieveDocument(logDocId).then(loDoc => {
      //         this.setState ({los: loDoc ["model"]["los"]});
      //       });
      //   });
    }
    
    /**
     *
     */            
    loadDocument (anID:string):any {
        console.log ("loadDocument ("+anID+")");
      let docu = new persistence.Document({
        _courseId: this.props.context.courseId,
        _id: this.props.model.guid,
        model: this.props.model
      });
      this.setState({modalIsOpen: false, treeData: this.props.model.organization, document: docu});
      //   persistence.retrieveDocument(anID).then(doc => {
      //
      //       console.log ("Loaded doc: " + JSON.stringify (doc));
      //
      //       this.setState ({modalIsOpen: false, treeData: doc.model ["organization"],document: doc});
      //       return (doc);
      //   });
      //
      //  return (null);
    }
    
    /**
     * 
     */
    saveToDB (newData?:any): void {
      console.log ("saveToDB ()");
        
      if (newData) {  
        let newModel=models.OrganizationModel.updateModel (this.state.orgData,newData);
                     
        let updatedDocument=this.state.document.set ('model',newModel);
          
        this.setState ({modalIsOpen: false, 'document' : updatedDocument },function () {           
          persistence.persistDocument(this.state.document)
            .then(result => {                
              this.loadDocument (this.state.documentId);
          });
        });         
      } else {         
        let newModel=models.OrganizationModel.updateModel (this.state.orgData,this.state.treeData);
                     
        let updatedDocument=this.state.document.set ('model',newModel);

        this.setState ({modalIsOpen: false, 'document' : updatedDocument },function () {         
          persistence.persistDocument(this.state.document)
            .then(result => {                
              this.loadDocument (this.state.documentId);
          });
        });
      }      
    }      

    /**
     * This method is called by the tree component and even though we could access
     * the state directly we're going to assume that the tree component made some
     * changes that haven't been reflected in the global component state yet.
     */
    processDataChange (newData: any) {
      console.log ("processDataChange ()");
                    
      this.saveToDB (newData ["treeData"]);      
    }    

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
        console.log ("addNode ()");
        
        var immutableHelper = this.state.treeData.slice()
        
        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode:OrgSequence=new OrgSequence ();
        newNode.title=("Title " + this.state.titleIndex);
        immutableHelper.push (newNode);
        
        this.setState ({titleIndex: this.state.titleIndex+1});

        this.saveToDB (immutableHelper);    
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
          
        let immutableHelper = this.state.treeData.slice();
                
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

        this.saveToDB (immutableHelper);    
    }
    
    /**
     * 
     */    
    addPage (aNode:any): void {
        console.log ("LearningObjectiveEditor:addPage ()");
                
        let immutableHelper = this.state.treeData.slice();
                
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
                var newNode:OrgItem=new OrgItem ();
                newNode.title=("Title " + this.state.titleIndex);
                testNode.children.push (newNode);
                break;
            }
        }
            
        this.saveToDB (immutableHelper);         
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
            
        this.saveToDB (immutableHelper);   
    }
    
    /**
     * 
     */
    linkLO(aNode:any) {        
        console.log ("OrganizationEditor:linkLO ()");
        //console.log ("aNode: " + JSON.stringify (aNode));
                
        this.setState ({modalIsOpen: true, orgTarget: aNode});
    }    
    
    /**
     * 
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
    genProps () {
        //console.log ("OrganizationEditor:genProps ()");
        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["linkAnnotation"]=this.linkLO.bind (this);
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["treeData"]=this.state.treeData;
        optionalProps ["addPage"]=this.addPage.bind (this);
        
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
      if (this.state.los!=null) {            
        return (<LearningObjectiveLinker closeModal={this.closeModal.bind (this)} sourceData={this.toFlat (this.state.los,new Array<Linkable>())} modalIsOpen={this.state.modalIsOpen} target={this.state.orgTarget} />);
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
      const lolinker=this.createLinkerDialog ();  
        //generateNodeProps={rowInfo => ({ onClick: () => console.log("rowInfo onClick ()") })}
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
                      onChange={ treeData => this.processDataChange({treeData}) }
                      nodeContentRenderer={OrganizationNodeRenderer}
                      generateNodeProps={this.genProps.bind(this)} 
                  />
              </div>
      );
    }
}

export default OrganizationEditor;
