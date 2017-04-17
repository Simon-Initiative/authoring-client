import * as React from 'react';
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

import { OrgItem } from '../organization/OrganizationTypes';
import { LOTypes, LearningObjective } from './LOTypes';
import LONodeRenderer from './LONodeRenderer';
import LearningObjectiveLinker from './LearningObjectiveLinker';

var loData=require ('./LO.json');

const tempnavstyle=
{
    h2:
    {
        marginRight: '10px'
    }
};

interface LearningObjectiveEditor 
{

}

export interface LearningObjectiveEditorState extends AbstractEditorState 
{
    treeData : any;  
    rootLO: any;
    modalIsOpen : boolean;
}

export interface LearningObjectiveEditorProps extends AbstractEditorProps<models.CourseModel>
{
  dispatch: any;
  documentId: string;
  userId: string;    
}

/**
*
*/
class LearningObjectiveEditor extends AbstractEditor<models.CourseModel,LearningObjectiveEditorProps, LearningObjectiveEditorState> 
{
    /**
     * 
     */
    constructor(props) {
        console.log ("LearningObjectiveEditor ()");
        
        super(props);
        this.state = {
                        treeData: this.processData (loData),
                        rootLO: this.createRootLO (loData),
                        modalIsOpen : false                    
                     };        
    }
    
    componentDidMount() {
        console.log ("componentDidMount ()");
    }    
    
    componentWillReceiveProps(nextProps) {
        console.log ("componentWillReceiveProps ();");    
    }    
    
    createRootLO (aData: any):Object {
        
        var newRootLO:LearningObjective=new LearningObjective ();
        
        for (var i in aData) {
            
            if (i=="objectives") {                
                var loRoot=aData [i];
                newRootLO.id=loRoot ["@id"];
                
                for (var j=0;j<loRoot ["#array"].length;j++) {
                    var lObjectiveTest=loRoot ["#array"][j];
                    
                    for (var k in lObjectiveTest) {
                        if (k=="title") {
                            newRootLO.title=this.getTextFromNode (lObjectiveTest [k]);                            
                        }
                    }
                }
            }
        }  
        
        return (newRootLO as Object);
    }
    
    /**
     * 
     */
    extractData (aData: any): Object {
        console.log ("extractData ()");
                                
        console.log ("From: " + JSON.stringify (aData));         
        
        var newData:Object=new Object ();
        newData ["objectives"]=new Object();
        newData ["objectives"]["@id"]=this.state.rootLO.id;
        newData ["objectives"]["#array"]=new Array ();
        newData ["objectives"]["#array"].push (OrgItem.addTextObject ("title",this.state.rootLO.title));
        
        for (var i=0;i<aData.length;i++)               
        {
            var testLOContainer:Object=new Object();
            var testLO=aData [i] as LearningObjective;
            testLOContainer ["objective"]=testLO.toJSONObject ();
            
            newData ["objectives"]["#array"].push (testLOContainer);
        }
       
        console.log ("To: " + JSON.stringify (newData));
        
        return (newData);
    }
    
    /**
     * 
     */
    processDataChange (newData: any) {
        console.log ("processDataChange ()");
        
        this.extractData (newData);        
        
        this.setState (newData);
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
     * 
     */
    getTextFromNode (aNode: any) : string {
        
      console.log ("getTextFromNode: " + JSON.stringify (aNode));
          
      // Check for old style text nodes  
      if (aNode ['#text']) { 
        return (aNode ['#text']);
      } 

      return ("");
    }

    parseLearningObjective (anObjective:Object): LearningObjective {

        var newLO:LearningObjective=new LearningObjective ();
        
        newLO.id=anObjective ["@id"];
        newLO.category=anObjective ["@category"];
        newLO.title=anObjective ["#text"];
        
        return (newLO);
    }
    
    /**
     * This method goes from external format to the format used by the tree renderer
     * Note that the tree widget needs to maintain any attributes we add to a node
     * object. Otherwise we can't annotate and enrich the structuer. 
     */
    processData (treeData: any) {
        
        var newData:Array<Object>=new Array ();
                
        for (var i in treeData) {
            
            if (i=="objectives") {                
                var loRoot=treeData [i];
                
                for (var j=0;j<loRoot ["#array"].length;j++) {
                    var lObjectiveTest=loRoot ["#array"][j];
                    
                    for (var k in lObjectiveTest) {
                        
                        if (k=="objective") {
                            newData.push (this.parseLearningObjective (lObjectiveTest [k]));                            
                        }                        
                    }
                }
            }
        }

        return (newData);
    }
    
    /**
     * Note that this manual method of adding a new node does not generate an
     * onChange event. That's why we call extractData manually as the very
     * last function call.
     */
    addNode (anEvent) {
        
        console.log ("addNode ()");
                
        var immutableHelper = this.state.treeData.slice()
        
        //var aData=this.state.treeData;

        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode:LearningObjective=new LearningObjective ();
        newNode.title="New Learning Objective";
        immutableHelper.push (newNode);

        this.extractData (immutableHelper);
        
        this.setState({treeData: immutableHelper});
    }
    
    deleteNode (aNode:any): void {
        console.log ("LearningObjectiveEditor:deleteNode ()");
            
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
                
        for (var i=0;i<immutableHelper.length;i++) {
            let testNode:Skill=immutableHelper [i];
            
            if (testNode.id==aNode.id) {
                immutableHelper.splice (i,1);
                break;
            }
        }
        
        this.setState({treeData: immutableHelper});
    }
    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("LearningObjectiveEditor:editTitle ()");
        
        let newTitle=aTitle.title.get ("#text");
            
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
                
        for (var i=0;i<immutableHelper.length;i++) {
            let testNode:Skill=immutableHelper [i];
            
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
    linkSkill(aNode:any) {        
        console.log ("LearningObjectiveEditor:linkSkill ()");
                
        this.setState ({modalIsOpen: true});
    }    
    
    
    genProps () {
        console.log ("LearningObjectiveEditor:genProps ()");
        
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
    render() {
        //console.log ("LearningObjectiveEditor:render ("+this.state.modalIsOpen+")");  
        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Learning Objectives</p>
                        <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                        <a className="nav-link" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                        <a className="nav-link" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                    </nav>
                    <LearningObjectiveLinker treeData={this.state.treeData} modalIsOpen={this.state.modalIsOpen} />
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
