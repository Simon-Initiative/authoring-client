import * as React from 'react';
import { PropTypes } from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import { LOTypes, LearningObjective } from '../../../data/los';
import {Resource} from "../../../data/resource";
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
  loModalIsOpen : boolean;
  pagesModalIsOpen : boolean;
  activitiesModalIsOpen : boolean;
  model: any;
  context: AppContext;
  los: models.LearningObjectiveModel;
  pages: any;
  activities: any;
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
        pages: null,
        activities: null,
        orgTarget: null,
        documentId: props.context.documentId,
        model: props.model,
        document: {},                
        loModalIsOpen: false,
        pagesModalIsOpen: false,
        activitiesModalIsOpen : false, 
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
                
      this.setState({orgData: this.props.model.toplevel, treeData: this.props.model.organization, document: docu}, function () {
        this.assignItemTypes ();    
      });
        
      this.loadLearningObjectives ();
      
      this.loadPages ();  
        
      this.loadActivities ();
    }
    
    /**
     * 
     */
    componentWillReceiveProps (newProps:OrganizationEditorProps) {
      console.log ("componentWillReceiveProps ()");

      this.setState({pagesModalIsOpen: false, loModalIsOpen: false, activitiesModalIsOpen : false, treeData: this.props.model.organization});  
    }
    
    /**
     * 
     */
    assignItemTypes () : void {
      console.log ("assignItemTypes ()");
        
      let immutableHelper = this.state.treeData.slice();
                
      this.assignType (immutableHelper);  

      this.onEdit (immutableHelper);          
    }
    
    /**
     * 
     */
    assignType (aNode:Array <OrgItem>): void
    {
      console.log ("assignType ()");
        
      for (let i=0;i<aNode.length;i++) {
        let targetObject:OrgItem=aNode [i] as OrgItem;
          
        console.log ("Examining node with type: " + targetObject.orgType);  
        
        if (targetObject.orgType==OrgContentTypes.Item) {
           console.log ("found an item, searching for type content ..."); 
           targetObject.typeDescription=this.findType (targetObject.resourceRef.idRef);
        }
          
        this.assignType (targetObject.children);  
      }          
    }      
    
    /**
     * 
     */
    findType (anId:string) : string {
      console.log ("findType ("+anId+")");
     
      let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
  
      let activityList:Array<Linkable>=new Array <Linkable>();        
        
      resourceList.map((value, id) => {        
        if (value.id==anId) {
          return (value.type);    
        }          
      })
        
      return ("undefined");  
    }
    
    /**
     * 
     */
    loadLearningObjectives () : void {
      console.log ("loadLearningObjectives ()");
            
      let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
  
      //console.log ("Resources: " + JSON.stringify (resourceList));  
        
      resourceList.map((value, id) => {        
        if (value.type=="x-oli-learning_objectives") {
          persistence.retrieveDocument (this.props.context.courseId,id).then(loDocument => 
          {
            let loModel:models.LearningObjectiveModel=loDocument.model as models.LearningObjectiveModel;   
            this.setState ({los: loModel.with (this.state.los)});
          });
        }          
      })  
    }    

    /**
     * We don't need to load anything from the database, everything is already contained the
     * course document we have access to by default. So all we have to do is transform
     * whichever workbook page reference we find into a Linkable and add it to the internal
     * list of Linkables.
     */
    loadPages () : void {
      console.log ("loadLearningObjectives ()");
            
      let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;

      let pageList:Array<Linkable>=new Array <Linkable>();  
        
      resourceList.map((value, id) => {
        if (value.type=="x-oli-workbook_page") {
          let pageLink:Linkable=new Linkable ();
          pageLink.id=value.guid;
          pageLink.title=value.title;
          pageList.push (pageLink);             
        }          
      })  
        
      this.setState ({pages: pageList});  
    }    
    
    /**
     * 
     */
    loadActivities () : void {
      console.log ("loadActivities ()");
            
      let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
  
      let activityList:Array<Linkable>=new Array <Linkable>();        
        
      resourceList.map((value, id) => {        
        if (value.type=="x-oli-inline-assessment") {
          let activityLink:Linkable=new Linkable ();
          activityLink.id=value.guid;
          activityLink.title=value.title;
          activityList.push (activityLink);    
        }          
      })  
        
      this.setState ({activities: activityList});    
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
        
      this.setState({loModalIsOpen: false, treeData: this.props.model.organization, document: docu});
    }
        
    /**
     * 
     */
    onEdit(newData?:any) {
        
      let newModel  

      if (newData) {
        newModel=models.OrganizationModel.updateModel (this.props.model, this.state.orgData,newData);
      } else {
        newModel=models.OrganizationModel.updateModel (this.props.model, this.state.orgData,this.state.treeData);
      }  
              
      this.props.onEdit(newModel); 
    }    

    /**
     * 
     */
    evaluateTree (aTree:Array<OrgItem>):Array <OrgItem> {
      console.log ("evaluateTree ()");
        
      for (let i=0;i<aTree.length;i++) {

        let evalSequence:OrgItem=aTree [i];
          
        for (let j=0;j<evalSequence.children.length;j++) {
          let evalModule:OrgItem=evalSequence.children [j];
            
          for (let k=0;k<evalModule.children.length;k++) {
            let evalSection:OrgItem=evalModule.children [k];
              
            if (evalSection.orgType!=OrgContentTypes.Section) {
              console.log ("Changing " + evalSection.orgType + " to section ...");
                        
              evalModule.children [k]=new OrgSection ();
              evalModule.children [k].id=evalSection.id;
              evalModule.children [k].expanded=evalSection.expanded;
              evalModule.children [k].annotations=evalSection.annotations;  
              evalModule.children [k].title=evalSection.title;
              evalModule.children [k].resourceRef=evalSection.resourceRef;  
              evalModule.children [k].children=evalSection.children;
              
              // At this point the evalSection variable should be orphaned but it's 
              // member variables should be re-assigned. Investigate this however!                     
            }              
          }  
            
          if (evalModule.orgType!=OrgContentTypes.Module) {
            console.log ("Changing " + evalModule.orgType + " to module ...");
                        
            evalSequence.children [j]=new OrgModule ();
            evalSequence.children [j].id=evalModule.id;
            evalSequence.children [j].expanded=evalModule.expanded;
            evalSequence.children [j].annotations=evalModule.annotations;  
            evalSequence.children [j].title=evalModule.title;
            evalSequence.children [j].resourceRef=evalModule.resourceRef;  
            evalSequence.children [j].children=evalModule.children;
              
            // At this point the evalModule variable should be orphaned but it's 
            // member variables should be re-assigned. Investigate this however!                     
          }  
        }  

        //>-----------------------------------------------------------------------  

        if (evalSequence.orgType!=OrgContentTypes.Sequence) {
          console.log ("Changing " + aTree [i].orgType + " to sequence ...");
                       
          aTree [i]=new OrgSequence ();
          aTree [i].id=evalSequence.id;
          aTree [i].expanded=evalSequence.expanded;
          aTree [i].annotations=evalSequence.annotations;  
          aTree [i].title=evalSequence.title;
          aTree [i].resourceRef=evalSequence.resourceRef;  
          aTree [i].children=evalSequence.children;

          // At this point the evalSequence variable should be orphaned but it's 
          // member variables should be re-assigned. Investigate this however!            
        }
          
        //>-----------------------------------------------------------------------          
      }
        
      return (aTree);
    }
    
    /**
     * This method is called by the tree component and even though we could access
     * the state directly we're going to assume that the tree component made some
     * changes that haven't been reflected in the global component state yet.
     */
    processDataChange (newData: any) {
      console.log ("processDataChange ()");
                    
      let fixedData:Array <OrgItem>=this.evaluateTree (newData ["treeData"]);  
        
      this.onEdit (fixedData);      
    }    
    
    /**
     * 
     */
    expand(expanded) {
        this.setState({
            treeData: toggleExpandedForAll({              
                pagesModalIsOpen: false, 
                loModalIsOpen: false, 
                activitiesModalIsOpen : false, 
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

        this.onEdit (immutableHelper);    
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
            
        this.onEdit (immutableHelper);   
    }

    /**
     * 
     */
    linkLO(aNode:any) {        
        console.log ("OrganizationEditor:linkLO ()");
                
        this.setState ({pagesModalIsOpen: false, loModalIsOpen: true, activitiesModalIsOpen : false, orgTarget: aNode});
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

        this.onEdit (immutableHelper);    
    }   
    
    /**
     *
     */
    addModule (aNode:any) {
      console.log ("addModule ()");
             
      let immutableHelper = this.state.treeData.slice();
                
      let parentArray:Array<Object>=this.findTreeParent (immutableHelper,aNode);
        
      if (immutableHelper==null) {
        console.log ("Bump");
        return;
      }
        
      if (parentArray!=null) {
        console.log ("We have an object, performing edit ...");
      } else {
        console.log ("Internal error: node not found in tree");
      }        
                        
      for (var i=0;i<parentArray.length;i++) {
        let testNode:OrgItem=parentArray [i] as OrgItem;
            
        if (testNode.id==aNode.id) {
          let newModule:OrgModule=new OrgModule ();
          newModule.title=("Module " + this.state.titleIndex);
          testNode.children.push (newModule);
          break;
        }
      }

      this.onEdit (immutableHelper);           
    }
    
    /**
     *
     */
    addSection (aNode:any) {
      console.log ("addSection ()");
             
      let immutableHelper = this.state.treeData.slice();
                
      let parentArray:Array<Object>=this.findTreeParent (immutableHelper,aNode);
        
      if (immutableHelper==null) {
        console.log ("Bump");
        return;
      }
        
      if (parentArray!=null) {
        console.log ("We have an object, performing edit ...");
      } else {
        console.log ("Internal error: node not found in tree");
      }        
                        
      for (var i=0;i<parentArray.length;i++) {
        let testNode:OrgItem=parentArray [i] as OrgItem;
            
        if (testNode.id==aNode.id) {
          let newSection:OrgSection=new OrgSection ();
          newSection.title=("Section " + this.state.titleIndex);
          testNode.children.push (newSection);
          break;
        }
      }

      this.onEdit (immutableHelper);         
    }    
    
    /**
     * 
     */    
    addPage (aNode:any): void {
        console.log ("LearningObjectiveEditor:addPage ()");
        
        //this.linkPage (aNode);
        this.setState ({pagesModalIsOpen: true, loModalIsOpen: false, activitiesModalIsOpen : false, orgTarget: aNode});                         
    }     
    
    /**
     * 
     */    
    addActivity (aNode:any): void {
        console.log ("LearningObjectiveEditor:addActivity ()");
        
        //this.linkPage (aNode);
        this.setState ({pagesModalIsOpen: false, loModalIsOpen: false, activitiesModalIsOpen : true, orgTarget: aNode});                         
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
        optionalProps ["addActivity"]=this.addActivity.bind (this);
        optionalProps ["addModule"]=this.addModule.bind (this);
        optionalProps ["addSection"]=this.addSection.bind (this);
        
        return (optionalProps);
    }
    
    /**
     * 
     */
    closeLOModal () {
      console.log ("LearningObjectiveEditor: closeLOModal ()");
        
      this.setState ({pagesModalIsOpen: false, loModalIsOpen: false, activitiesModalIsOpen : false}, function (){
        this.onEdit ();
      });                
    }        
        
    /**
     * 
     */
    closePagesModal () {
      console.log ("LearningObjectiveEditor: closePagesModal ()");
        
      this.setState ({pagesModalIsOpen: false, loModalIsOpen: false, activitiesModalIsOpen : false});        
        
      let immutableHelper = this.state.treeData.slice();
                
      let parentArray:Array<Object>=this.findTreeParent (immutableHelper,this.state.orgTarget);
        
      if (immutableHelper==null) {
        console.log ("Bump");
        return;
      }
        
      if (parentArray!=null) {
        console.log ("We have an object, performing edit ...");
      } else {
        console.log ("Internal error: node not found in tree");
      }
                    
      for (var i=0;i<parentArray.length;i++) {
        let testNode:OrgItem=parentArray [i] as OrgItem;
            
        if (testNode.id==this.state.orgTarget.id) {
          var newNode:OrgItem=new OrgItem ();
          newNode.title=testNode.title;
          newNode.typeDescription="x-oli-workbook_page";  
          testNode.children.push (newNode);
          break;
        }
      }
            
      this.onEdit (immutableHelper);
    }    
    
    /**
     * 
     */
    closeActivtiesModal () {
      console.log ("LearningObjectiveEditor: closeActivtiesModal ()");
        
      this.setState ({pagesModalIsOpen: false, loModalIsOpen: false, activitiesModalIsOpen : false}, function () {
        let immutableHelper = this.state.treeData.slice();
                
        let parentArray:Array<Object>=this.findTreeParent (immutableHelper,this.state.orgTarget);
        
        if (immutableHelper==null) {
          console.log ("Bump");
          return;
        }

        if (parentArray!=null) {
          console.log ("We have an object, performing edit ...");
        } else {
          console.log ("Internal error: node not found in tree");
        }
                    
        for (var i=0;i<parentArray.length;i++) {
          let testNode:OrgItem=parentArray [i] as OrgItem;
            
          if (testNode.id==this.state.orgTarget.id) {
            var newNode:OrgItem=new OrgItem ();
            newNode.title=testNode.title;
            newNode.typeDescription="x-oli-inline-assessment";
            testNode.children.push (newNode);
            break;
          }
        }
            
        this.onEdit (immutableHelper);          
      });                
    }     
    
    /**
     * 
     */
    createLOLinkerDialog () {                
      if (this.state.loModalIsOpen==true) {  
        if (this.state.los!=null) {
          console.log ("createLOLinkerDialog ()");              
          return (<LearningObjectiveLinker title="Available Learning Objectives" closeModal={this.closeLOModal.bind (this)} sourceData={models.LearningObjectiveModel.toFlat (this.state.los.los,new Array<Linkable>())} modalIsOpen={this.state.loModalIsOpen} targetAnnotations={this.state.orgTarget.annotations} />);
        } else {
          console.log ("Internal error: learning objectives object can be empty but not null");
        }
      }    
                   
      return (<div></div>);           
    }
    
    /**
     * 
     */
    createActivityLinkerDialog () {                
      if (this.state.activitiesModalIsOpen==true) {  
        if (this.state.activities!=null) {
          console.log ("createLinkerDialog ()");              
          return (<LearningObjectiveLinker title="Available Activities" closeModal={this.closeActivtiesModal.bind (this)} sourceData={this.state.activities} modalIsOpen={this.state.activitiesModalIsOpen} targetAnnotations={this.toActivityList (this.state.orgTarget)} />);
        } else {
          console.log ("Internal error: activities object can be empty but not null");
        }
      }    
                   
      return (<div></div>);           
    }    
    
    /**
     * 
     */
    createPageLinkerDialog () {      
      if (this.state.pagesModalIsOpen==true) {
        if (this.state.pages!=null) {
          console.log ("createPageLinkerDialog ()");
          return (<LearningObjectiveLinker title="Available Workbook Pages" closeModal={this.closePagesModal.bind (this)} sourceData={this.state.pages} modalIsOpen={this.state.pagesModalIsOpen} targetAnnotations={this.toPageList (this.state.orgTarget)} />);
        } else {
          console.log ("Internal error: pages array object can be empty but not null");
        }
      }    
                   
      return (<div></div>);           
    }
    
    /**
     * 
     */
    toActivityList (aNode) : Array <Linkable> {
      console.log ("toActivityList ()");
        
      var actList:Array<Linkable>=new Array ();  
        
      for (let i=0;i<aNode.children.length;i++) {
          let testItem:OrgItem=aNode.children [i];
          
          if (testItem.typeDescription=="x-oli-inline-assessment") {
            let ephemeral:Linkable=new Linkable ();
            ephemeral.title=testItem.title;
            ephemeral.id=testItem.id;  
            actList.push (ephemeral);
          }
      }
        
      return (actList);  
    }
    
    /**
     * 
     */
    toPageList (aNode) : Array <Linkable> {
      console.log ("toPageList ()");

      var actList:Array<Linkable>=new Array ();  
        
      for (let i=0;i<aNode.children.length;i++) {
          let testItem:OrgItem=aNode.children [i];
          
          if (testItem.typeDescription=="x-oli-workbook_page") {
            let ephemeral:Linkable=new Linkable ();
            ephemeral.title=testItem.title;
            ephemeral.id=testItem.id;  
            actList.push (ephemeral);
          }
      }  
        
      return (actList);         
    }    
    
    /**
     * 
     */
    canDrop (aNode) {
      console.log ("canDrop ()");  
        
      return (true);
    }
            
    /**
     * 
     */
    render() 
    {      
      const lolinker=this.createLOLinkerDialog ();  
      const pagelinker=this.createPageLinkerDialog ();
      const activitylinker=this.createActivityLinkerDialog ();
      
      return (
              <div>
                  <div>
                      <h2 className="h2 organize" style={tempnavstyle.h2}>Course Content</h2>
                      <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Sequence</button>
                      <a className="btn btn-secondary" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                      <a className="btn btn-secondary" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                  </div>
                  {lolinker}
                  {pagelinker}
                  {activitylinker}
                  <SortableTree
                      maxDepth={3}
                      treeData={this.state.treeData}
                      onChange={ treeData => this.processDataChange({treeData}) }
                      nodeContentRenderer={OrganizationNodeRenderer}
                      generateNodeProps={this.genProps.bind(this)} 
                      canDrop={this.canDrop.bind(this)} 
                  />
              </div>
      );
    }
}

export default OrganizationEditor;
