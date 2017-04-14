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

import SkillNodeRenderer from './SkillNodeRenderer';
import {Skill} from './SkillTypes';

var skillData=require ('./Skills.json');

const tempnavstyle=
{
    h2:
    {
        marginRight: '10px'
    }
};

interface SkillEditor 
{

}

export interface SkillEditorState extends AbstractEditorState 
{
    treeData : any;  
}

export interface SkillEditorProps extends AbstractEditorProps<models.CourseModel>
{
  dispatch: any;
  documentId: string;
  userId: string;    
}

/**
*
*/
class SkillEditor extends AbstractEditor<models.CourseModel,SkillEditorProps, SkillEditorState> 
{
    /**
     * 
     */
    constructor(props) {
        console.log ("SkillEditor ()");
        
        super(props);
        this.state = {
                        treeData: this.processData(skillData)
                    };
        
        this.deleteNode = this.deleteNode.bind(new Object());
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
     * Here we go from visual data to database-ready data. We walk the tree
     * and build a db JSON ready representation. We could have done this
     * recursively but since we have to tag every level with a certain type
     * in output tree it was easier to do this in one function for now.
     */
    extractData (aData: any): Object {
        //console.log ("extractData ()");
        
        //console.log ("Extracting from: " + JSON.stringify (aData));
                        
        var dbReady:Object=new Object();
        dbReady ["skills"]=new Array ();
                                                
        for (var i=0;i<aData.length;i++) {
            var targetSkillObject=aData [i] as Skill;
            dbReady ["skills"].push (targetSkillObject.toJSONObject ());
        }

        //console.log ("From: " + JSON.stringify (aData));
        //console.log ("To: " + JSON.stringify (dbReady));
        
        return (dbReady);
    }
        
    /**
     * This method goes from external format to the format used by the tree renderer
     * Note that the tree widget needs to maintain any attributes we add to a node
     * object. Otherwise we can't annotate and enrich the structuer. 
     */
    processData (treeData: any) {
        
        var newData:Array<Object>=new Array ();

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
        
        var newNode:Skill=new Skill ();
        newNode.title="New Skill";
        immutableHelper.push (newNode);

        this.extractData (immutableHelper);
        
        this.setState({treeData: immutableHelper});
    }     

    deleteNode (aNode:any): void {
        console.log ("SkillEditor:deleteNode ()");
        //console.log ("Deleting: " + JSON.stringify (aNode));
    }
    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("editTitle ()");
        
        let newTitle=aTitle.title.get ("#text");
        
        //console.log ("Changing title for: " + JSON.stringify (aNode));
        console.log ("New title: " + newTitle);
        
        aNode.title=newTitle;
    }
    
    genProps () {
        console.log ("SkillEditor:genProps ()");
        
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["treeData"]=this.state.treeData;
        
        return (optionalProps);
    }
        
    /**
     * 
     */
    render() {            
        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Skills</p>
                        <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                    </nav>
                    <SortableTree
                        maxDepth={1}
                        treeData={this.state.treeData}
                        onChange={ treeData => this.processDataChange({treeData}) }
                        nodeContentRenderer={SkillNodeRenderer}
                        //generateNodeProps={this.genProps.bind (this.state.treeData,this.deleteNode)}
                        //generateNodeProps={this.handleClick.bind(this)}
                        generateNodeProps={this.genProps.bind(this)}
                    />
                </div>
        );
    }
}

export default SkillEditor;
