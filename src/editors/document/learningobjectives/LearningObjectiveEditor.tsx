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

import { LOTypes, LearningObjective } from './LOTypes.ts';

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
                        rootLO: this.createRootLO (loData)                        
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
                
        var changedData=aData.treeData;
        
        var newData:Object=new Object ();
        
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
        
        var aData=this.state.treeData;

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

    /**
     * 
     */
    render() {            
        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Learning Objectives</p>
                        <button type="button" className="btn btn-secondary">Add Item</button>
                        <a className="nav-link" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                        <a className="nav-link" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                    </nav>
                    <SortableTree
                        treeData={this.state.treeData}
                        generateNodeProps={rowInfo => ({
                          onClick: () => console.log(1),
                        })}
                        onChange={ treeData => this.processDataChange({treeData}) }
                        /*nodeContentRenderer={NodeRendererDefault}*/
                    />
                </div>
        );
    }
}

export default LearningObjectiveEditor;
