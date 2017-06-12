import * as React from 'react';
import { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import { returnType } from '../../../utils/types';
import { LOTypes, LearningObjective } from '../../../data/los';
import {Resource} from "../../../data/resource";
import Linkable from '../../../data/linkable';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import { UndoRedoToolbar } from '../common/UndoRedoToolbar';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

import {OrgContentTypes,IDRef,OrgItem,OrgSection,OrgSequence,OrgModule,OrgOrganization} from '../../../data/org'
import OrganizationNodeRenderer from './OrganizationNodeRenderer';

import LearningObjectiveLinker from '../../../components/LinkerDialog';

import { AppContext } from '../../common/AppContext';

const orgstyle=
{
    h2: {
      marginRight: '10px'
    },
    treeStyle: {
      //border: "1px solid green"
      height: "100%",    
    },
    treeInnerStyle: {
      //border: "1px solid red"  
    }
};

interface OrganizationEditor 
{
  viewActions: any;
}

export interface OrganizationEditorState extends AbstractEditorState 
{    
  treeData : any;
  loModalIsOpen : boolean;
  pagesModalIsOpen : boolean;
  activitiesModalIsOpen : boolean;
  model: any;
  context: AppContext;
  los: Array <LearningObjective>;  
  pages: any;
  activities: any;
  orgTarget : any;
  document: any;
  documentId: string;
  titleIndex:number;    
  loadState:number;  
}

export interface OrganizationEditorOwnProps extends AbstractEditorProps<models.OrganizationModel>
{
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;    
  context: AppContext;
}

function mapStateToProps(state: any) {

  const {
    course,
  } = state;

  return {
    course,
  };
}

const stateGeneric = returnType(mapStateToProps);
type OrganizationEditorReduxProps = typeof stateGeneric;
type OrganizationEditorProps = OrganizationEditorReduxProps & OrganizationEditorOwnProps & { dispatch };

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
        titleIndex: 0,
        loadState: 0
      });
        
      this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);  
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
                
      this.setState({treeData: this.props.model.organization, document: docu});
        
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
            
          this.setState ({los: tempLOArray}, () => {

            //console.log ("Data: " + JSON.stringify (this.state.los));              
              
            this.resolveReferences ();
          });
                    
        } else {
          console.log ("Error: no learning objectives retrieved!");  
        }         
      });   
    }    

    /**
     * We don't need to load anything from the database, everything is already contained the
     * course document we have access to by default. So all we have to do is transform
     * whichever workbook page reference we find into a Linkable and add it to the internal
     * list of Linkables.
     */
    loadPages () : void {
      console.log ("loadPages ()");
        
      let pageList:Array<Linkable>=new Array <Linkable>();  
        
      this.props.context.courseModel.resources.map((value, id) => {
        if (value.type=="x-oli-workbook_page") {
          let pageLink:Linkable=new Linkable ();
          pageLink.id=value.guid;
          pageLink.title=value.title;
          pageList.push (pageLink);             
        }          
      })  
        
      this.setState ({pages: pageList},function (){
        this.resolveReferences ();                
      });         
    }    
    
    /**
     * 
     */
    loadActivities () : void {
      console.log ("loadActivities ()");
        
      let activityList:Array<Linkable>=new Array <Linkable>();        
        
      this.props.context.courseModel.resources.map((value, id) => {        
        if ((value.type=="x-oli-inline-assessment") || (value.type=="x-oli-assessment2")) {
          let activityLink:Linkable=new Linkable ();
          //console.log ("Activity Check: " + JSON.stringify (value));   
          activityLink.id=value.guid;
          activityLink.title=value.title;
          activityList.push (activityLink);    
        }          
      })  
        
      this.setState ({activities: activityList},function () {
        this.resolveReferences ();
      });         
    }
    
    /**
     * 
     */
    resolveReferences () : void {
       console.log ("resolveReferences ("+this.state.loadState+")");
        
       this.setState ({loadState : (this.state.loadState + 1)}, function () {
         if (this.state.loadState>1) {
           //console.log ("Kicking in model validation ...");
           this.assignItemTypes ();  
         }
       }); 
    }
    
    /**
     * 
     */
    assignItemTypes () : void {
      console.log ("assignItemTypes ()");
        
      let immutableHelper = this.state.treeData.slice();
                
      this.assignType (immutableHelper);

      this.orgOnEdit (immutableHelper);          
    }
    
    /**
     * 
     */
    assignType (aNode:Array <OrgItem>): void
    {
      //console.log ("assignType ()");
        
      for (let i=0;i<aNode.length;i++) {
        let targetObject:OrgItem=aNode [i] as OrgItem;
          
        //console.log ("Examining node with type: " + targetObject.orgType);  
        
        if (targetObject.orgType==OrgContentTypes.Item) {
           //console.log ("found an item, searching for type content ..."); 
           //targetObject.typeDescription=this.findType (targetObject.resourceRef.idRef);
           //targetObject.typeDescription=this.findType (targetObject.id);
            
           let testTarget:any=this.findTarget (targetObject.id); 
            
           if (testTarget!=null) { 
             targetObject.typeDescription=testTarget.type;
             targetObject.id=testTarget.guid;
             targetObject.title=testTarget.title;
           }    
        }
                   
        if (targetObject.children.length>0) {  
          this.assignType (targetObject.children);
        }      
      }          
    }
    
    /**
     * This is currently highly inefficient since we can't break out of the map routine
     * by using 'return'. Should be changed when possible because this can become a
     * time sink.
     */
    findTarget (anId:string) : Object {
      //console.log ("findTarget ("+anId+")");
        
      let foundTarget:Object=null;  
        
      this.props.context.courseModel.resources.map((value, id) => {        

        if (value.id==anId) {
          foundTarget=value;              
        }              
      })          
        
      return (foundTarget);
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
    orgOnEdit(newData?:any) {
          
      let newModel

      if (newData) {
        newModel=models.OrganizationModel.updateModel (this.props.model,newData);
        this.setState ({treeData: newData});
      } else {
        newModel=models.OrganizationModel.updateModel (this.props.model,this.state.treeData);
      }
        
      newModel.toPersistence ();  

      //this.props.onEdit(newModel);
      //this.onEdit(newModel);
      this.handleEdit (newModel);  
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
              
            if ((evalSection.orgType!=OrgContentTypes.Section) && (evalSection.orgType!=OrgContentTypes.Item)) {
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
            
          if ((evalModule.orgType!=OrgContentTypes.Module) && (evalModule.orgType!=OrgContentTypes.Item)) {
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

        if ((evalSequence.orgType!=OrgContentTypes.Sequence) && (evalSequence.orgType!=OrgContentTypes.Item)) {
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
        
      console.log ("Changed tree data: " + JSON.stringify (newData));  
                    
      let fixedData:Array <OrgItem>=this.evaluateTree (newData ["treeData"]);
        
      console.log ("Fixed tree data: " + JSON.stringify (fixedData));
        
      this.orgOnEdit (fixedData);      
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

        this.orgOnEdit (immutableHelper);    
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
            
        this.orgOnEdit (immutableHelper);   
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

        this.orgOnEdit (immutableHelper);    
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
        
          this.setState ({titleIndex: this.state.titleIndex+1});
        
          break;
        }
      }

      this.orgOnEdit (immutableHelper);           
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
                    
          this.setState ({titleIndex: this.state.titleIndex+1});
            
          testNode.children.push (newSection);
          break;
        }
      }

      this.orgOnEdit (immutableHelper);         
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
    closeLOModal (annotations:any) {
      console.log ("LearningObjectiveEditor: closeLOModal ()");
      //console.log ("Processing annotations: " + JSON.stringify (annotations));
        
      this.setState ({pagesModalIsOpen: false, loModalIsOpen: false, activitiesModalIsOpen : false}, function (){
        this.orgOnEdit ();
      });                
    }        
        
    /**
     * 
     */
    closePagesModal (annotations:any) {
      console.log ("closePagesModal ()");

      this.modifyItem (annotations,"x-oli-workbook_page");
    }    
    
    /**
     * 
     */
    closeActivtiesModal (annotations:any) {
      console.log ("closeActivtiesModal ()");
        
      this.modifyItem (annotations,"x-oli-inline-assessment");          
    }

    /**
     * 
     */
    modifyItem (annotations:any,itemType:string) : void {
      console.log ("modifyItem ()");    

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

            let mergedList:Array<OrgItem>=new Array ();

            // First migrate all existing nodes (if they are not
            // assessments into our new list

            for (let t=0;t<testNode.children.length;t++) {
              let mergeNode:OrgItem=testNode.children [t];
              if (mergeNode.typeDescription!=itemType) {
                mergedList.push (mergeNode);             
              }
            }

            // Then copy over all the assessment nodes as they 
            // were managed by the linker dialog and also add
            // them to the list

            for (let j=0;j<annotations.length;j++) {
              let originNode:Linkable=annotations [j];            

              var newNode:OrgItem=new OrgItem ();
              newNode.id=originNode.id;
              //newNode.resourceRef.idRef=originNode.resourceRef.idRef;
              newNode.title=originNode.title;
              newNode.typeDescription=itemType;  
              mergedList.push (newNode);
            }

            testNode.children=mergedList;

            break;
          }
        }

        this.orgOnEdit (immutableHelper);          
      });    
    }
    
    /**
     * 
     */
    createLOLinkerDialog () {
      console.log ("createLOLinkerDialog ()");
                
      let targetAnn:Array<Linkable>=new Array ();

      if (this.state.orgTarget) {
        targetAnn=this.state.orgTarget.annotations;
      }

      if (this.state.los) {  
        return (<LearningObjectiveLinker title="Available Learning Objectives" 
                                         errorMessage="" 
                                         closeModal={this.closeLOModal.bind (this)} 
                                         sourceData={models.LearningObjectiveModel.toFlat (this.state.los,new Array<Linkable>())} 
                                         modalIsOpen={this.state.loModalIsOpen} targetAnnotations={targetAnn} />);
      }
        
      return (<LearningObjectiveLinker title="Error" 
                                       errorMessage="No learning objectives available, did you create a Learning Objectives document?" 
                                       closeModal={this.closeLOModal.bind (this)}
                                       sourceData={[]} modalIsOpen={this.state.loModalIsOpen}
                                       targetAnnotations={targetAnn} />);           
    }
    
    /**
     * 
     */
    createActivityLinkerDialog () {                
      if (this.state.activitiesModalIsOpen==true) {  
        if (this.state.activities) {
          console.log ("createLinkerDialog ()");              
          return (<LearningObjectiveLinker title="Available Activities" closeModal={this.closeActivtiesModal.bind (this)} sourceData={this.state.activities} modalIsOpen={this.state.activitiesModalIsOpen} targetAnnotations={this.toItemList (this.state.orgTarget,"x-oli-inline-assessment")} />);
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
        if (this.state.pages) {
          console.log ("createPageLinkerDialog ()");
          return (<LearningObjectiveLinker title="Available Workbook Pages" closeModal={this.closePagesModal.bind (this)} sourceData={this.state.pages} modalIsOpen={this.state.pagesModalIsOpen} targetAnnotations={this.toItemList (this.state.orgTarget,"x-oli-workbook_page")} />);
        } else {
          console.log ("Internal error: pages array object can be empty but not null");
        }
      }    
                   
      return (<div></div>);
    }
    
    /**
     * 
     */
    toItemList (aNode:any,aNodeType:string) : Array <Linkable> {
      console.log ("toItemList ()");
        
      var actList:Array<Linkable>=new Array ();  
        
      for (let i=0;i<aNode.children.length;i++) {
          let testItem:OrgItem=aNode.children [i];
          
          if (testItem.typeDescription==aNodeType) {
            let ephemeral:Linkable=new Linkable ();
            ephemeral.title=testItem.title;
            ephemeral.id=testItem.id;
            //ephemeral.id=testItem.resourceRef.idRef;
            actList.push (ephemeral);
          }
      }
        
      return (actList);  
    }
      
    /**
     * A vital function we use to determine if a node in the sortable tree can be moved. For
     * example a workbook page or assessment can be moved within and between items but can't
     * be assigned to any other node in the tree. Please us the official DTD to build and
     * verify the rules below. http://oli.web.cmu.edu/dtd/oli_content_organization_simple_2_2.dtd  
     */
    canDrop (anObject:Object) : boolean {
      console.log ("canDrop ()");
          
      if (anObject ["nextParent"]) {
          
        if ((anObject ["node"]["orgType"]=="Item") && (anObject ["nextParent"]["orgType"]=="Item")) {
          console.log ("Can't put an item below an item");  
          return (false);  
        }
          
        if ((anObject ["node"]["orgType"]!="Item") && (anObject ["nextParent"]["orgType"]=="Section")) {
          console.log ("Can't put a sequence in a section");  
          return (false);  
        }          

        if ((anObject ["node"]["orgType"]!="Item") && (anObject ["nextParent"]["orgType"]=="Sequence")) {
          console.log ("Can't put an item in a sequence");  
          return (false);  
        }
      }

      console.log ("returning true");
  
      return (true);
    }

    /**
     * Helper method given to the sortable tree so that we can provide access to functionality
     * in the org editor directly within each node renderer.
     */    
    genProps () {        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["linkAnnotation"]=this.linkLO.bind (this);        
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["treeData"]=this.state.treeData;
        optionalProps ["addPage"]=this.addPage.bind (this);
        optionalProps ["addActivity"]=this.addActivity.bind (this);
        optionalProps ["addModule"]=this.addModule.bind (this);
        optionalProps ["addSection"]=this.addSection.bind (this);
        optionalProps ["editWorkbookPage"]=this.editWorkbookPage.bind (this);
        optionalProps ["editAssessment"]=this.editAssessment.bind (this);        
        
        return (optionalProps);
    }                

    /**
     * 
     */
    doUndo () : void {
      console.log ("doUndo ()");

    }

    /**
     * 
     */
    doRedo () : void {
      console.log ("doRedo ()");

    }
    
    /**
     * 
     */
    editWorkbookPage (aNode):void {
      console.log ("editWorkbookPage");

      this.setState ({orgTarget: aNode}, () => {
        this.props.dispatch(viewActions.viewDocument(aNode.id));
      });  
    }
    
    /**
     * 
     */
    editAssessment (aNode):void {
      console.log ("editAssessment");
      
      this.setState ({orgTarget: aNode}, () => {
        this.props.dispatch(viewActions.viewDocument(aNode.id));
      });      
    }
    
    /**
     * 
     */
    check ():void {
      console.log ("check ()");
              
      this.orgOnEdit (null); 
    }
    
    /**
     * 
     */    
    handleTitleChange (event:any) : void {
      console.log ("handleTitleChange ()");
                
      let newTopLevel:OrgOrganization=new OrgOrganization ();
      newTopLevel.version=this.state.model.toplevel.version;      
      newTopLevel.audience=this.state.model.toplevel.audience;
      newTopLevel.description=this.state.model.toplevel.description;
      newTopLevel.title=event.target.value;
        
      this.setState({model: this.state.model.with ({'toplevel': newTopLevel})});  
    }
    
    /**
     * 
     */    
    handleDescriptionChange (event:any) : void {
      console.log ("handleDescriptionChange ()");
        
      let newTopLevel:OrgOrganization=new OrgOrganization ();
      newTopLevel.version=this.state.model.toplevel.version;      
      newTopLevel.audience=this.state.model.toplevel.audience;
      newTopLevel.description=event.target.value;
      newTopLevel.title=this.state.model.toplevel.title;
        
      this.setState({model: this.state.model.with ({'toplevel': newTopLevel})});        
    }
    
    /**
     * 
     */    
    handleAudienceChange (event:any) : void {
      console.log ("handleAudienceChange ()");
        
      let newTopLevel:OrgOrganization=new OrgOrganization ();
      newTopLevel.version=this.state.model.toplevel.version;      
      newTopLevel.audience=event.target.value;
      newTopLevel.description=this.state.model.toplevel.description;
      newTopLevel.title=this.state.model.toplevel.title;
        
      this.setState({model: this.state.model.with ({'toplevel': newTopLevel})});        
    }    

    /**
     * 
     */
    render() 
    {      
      console.log ("render ()");
        
      const lolinker=this.createLOLinkerDialog ();  
      const pagelinker=this.createPageLinkerDialog ();
      const activitylinker=this.createActivityLinkerDialog ();
      
      return (
              <div>
                  <div>
                      <h2 className="h2 organize" style={orgstyle.h2}>Course Content</h2>
                      <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Sequence</button>
                      <a className="btn btn-secondary" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                      <a className="btn btn-secondary" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                      <UndoRedoToolbar onUndo={this.doUndo.bind(this)}
                                       onRedo={this.doRedo.bind(this)}             
                                       undoEnabled={this.state.undoStackSize > 0}
                                       redoEnabled={this.state.redoStackSize > 0}></UndoRedoToolbar>
                  </div>
                  <div>
                   <label>
                   Organization Title: <input type="text" value={this.state.model.toplevel.title} onChange={e => this.handleTitleChange (e)} />
                   </label>
                   <label>
                   Organization Description: <input type="text" value={this.state.model.toplevel.description} onChange={e => this.handleDescriptionChange (e)} />
                   </label>
                   <label>
                   Audience: <input type="text" value={this.state.model.toplevel.audience} onChange={e => this.handleAudienceChange (e)} />
                   </label>                       
                  </div>
                  {lolinker}
                  {pagelinker}
                  {activitylinker}
                  <SortableTree id="orgtree"
                      style={orgstyle.treeStyle}
                      innerStyle={orgstyle.treeInnerStyle}
                      maxDepth={5}
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

//export default OrganizationEditor;
export default connect<OrganizationEditorReduxProps, {}, OrganizationEditorOwnProps>
  (mapStateToProps)(OrganizationEditor);
