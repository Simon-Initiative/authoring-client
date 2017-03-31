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

import {IDRef} from './OrganizationTypes'
import OrgTreeNode from './OrganizationTypes'
import OrganizationNodeRenderer from './OrganizationNodeRenderer';

//import orgData from './organization.json'; // does not work
var orgData=require ('./organization.json');

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
}

export interface OrganizationEditorProps extends AbstractEditorProps<models.CourseModel>
{
  dispatch: any;
  documentId: string;
  userId: string;    
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
        console.log ("OrganizationEditor ()");
        
        super(props);

        this.state = {
                        treeData: this.processData(orgData)
                     };
    }
        
    /**
     * 
     */
    componentDidMount() {
        console.log ("componentDidMount ()");
        
        this.fetchTitles(this.props.documentId);
        
        //this.processData (orgData);
    }    
    
    /**
     * 
     */
    fetchTitles(documentId: types.DocumentId) {
        console.log ("fetchTitles ();");
        
        persistence.queryDocuments(titlesForCoursesResources(documentId)).then(docs => {
            /*
            this.setState(
            {
                resources: docs.map(d => ({ _id: d._id, title: (d as any).title.text, type: (d as any).modelType}))
            })
            */
        });
    }

    /**
     * 
     */
    componentWillReceiveProps(nextProps) {
        console.log ("componentWillReceiveProps ();");
        
        if (this.props.documentId !== nextProps.documentId) 
        {
          this.fetchTitles(nextProps.documentId);
        }
    }    
    
    /**
     * 
     */
    getTextFromNode (aNode: any) : string {
        var testString:string=aNode ['text'];
        
        console.log ("getTextFromNode ("+testString+")");
        
        return (testString);
    }
    
    /**
     * Here we go from visual data to database ready data. We walk the tree
     * and build a db JSON ready representation.
     */
    extractData (treeData: any) {
        console.log ("extractData ()");
        
        console.log ("New data: " + JSON.stringify (treeData));
    }
    
    resolveItem (anItem:any):string {
        
        return ("");
    }
    
    /**
     * This method exists to handle the specific structure we find in serialized OLI
     * organization content. For example:
     * {
     *      "item" : {
     *          "@scoring_mode" : "default",
     *          "resourceref" : {
     *              "@idref" : "test02a_embedded_workbook"
     *          }
     *      }
     *  }
     */
    getNodeType (aNode: any): string {
        console.log ("getNodeType ()");
        
        for (var i in aNode) {            
            return (i);
        }
        
        return ("");
    }

    /**
     * Parses a structure that looks like this:
     * {
     *   "item": {
     *            "@scoring_mode": "default",
     *            "resourceref": {
     *              "@idref": "test03_sections_workbook"
     *            }
     *   }
     * },
     */
    parseItem (anItem: any): OrgTreeNode {
        console.log ("parseItem ()");
        
        var newNode: OrgTreeNode=new OrgTreeNode ();
        
        for (var i in anItem) {
            
            console.log ("item: " + i);
            
            if (i=="@scoring_mode") {
                newNode.scoringMode=anItem [i];
            }
            
            if (i=="resourceref") {
                newNode.title=anItem [i]["@idref"];
                newNode.resourceRef.idRef=anItem [i]["@idref"];
            }            
        }
        
        return (newNode);
    }
    
    /**
     * 
     */
    parseSection (aSection: any): OrgTreeNode {
        console.log ("parseSection ()");
        
        var newNode: OrgTreeNode=new OrgTreeNode ();
        
        for (var i=0;i<aSection.length;i++)
        {
            var potentialSection=aSection [i];
            
            for (var j in potentialSection) {
                if (j=="title") {
                  newNode.title=this.getTextFromNode (potentialSection [j]);  
                }
                
                if (j=="item") {
                  newNode.addNode (this.parseItem (potentialSection [j]));
                }                
            }
        }
        
        return (newNode);
    }
    
    /**
     * 
     */
    parseModule (aModule: any) : OrgTreeNode {
      console.log ("parseModule ()");
        
      let moduleNode=new OrgTreeNode (); 
        
      for (var t=0; t<aModule.length;t++) {
        var mContents=aModule [t];
           
        for (var s in mContents) {
          
          var mdl=mContents [s];
          //var newNode:OrgTreeNode=new OrgTreeNode ();
            
          if (s=="title") {            
            //console.log ("Found title: " + this.getTextFromNode (mdl));                                  
            moduleNode.title=this.getTextFromNode (mdl); 
          }                                 
          
          if (s=="item") {
              console.log ("Found item");
              
              moduleNode.addNode (this.parseItem (mdl));
          }                
            
          if (s=="section") {
              console.log ("Found section");
              
               moduleNode.addNode (this.parseSection (mdl));
            }
        }
      }
        
      return (moduleNode);
    }
    
    /**
     * This method goes from external format to the format used by the tree renderer
     * Note that the tree widget needs to maintain any attributes we add to a node
     * object. Otherwise we can't annotate and enrich the structuer. 
     */
    processData (treeData: any) {
        
        console.log ("processData ()");
        
        var newData=[];
        
        for (var i in treeData) {           
          var oList=treeData [i]
                        
            if (i=='organization') {
               for (var k=0;k<oList.length;k++) {
                   
                   var obj=oList [k];
                   
                   for (var j in obj) {    
                   
                       var destNode = obj [j];
                                      
                       if (j=='title') {
                         console.log ("Title: " + this.getTextFromNode (destNode));
                       }
                   
                       if (j=='description') {
                         console.log ("description: " + this.getTextFromNode (destNode));                     
                       }
                       
                       if (j=='audience') {
                         console.log ("audience: " + this.getTextFromNode (destNode));
                       }

                      if (j=='sequences') {
                      
                        var seqIndex=0;
                                                                     
                        var sequenceList: Array <any>= destNode ["sequence"];   
                                                                              
                        var tempTitle="Undefined";
                          
                        let sequenceNode=new OrgTreeNode ();                                                   
                        newData [seqIndex]=sequenceNode;                          
                          
                        for (var t=0; t<sequenceList.length;t++) {
                          var seq=sequenceList [t];
                            
                          console.log ("Inspecting sequence: " +  JSON.stringify (seq));  
                                                      
                          for (var s in seq) {
                              
                              var mdl=seq [s];
                              
                              if (s=="title") {
                                  console.log ("Found title: " + this.getTextFromNode (mdl));                                  
                                  sequenceNode.title=this.getTextFromNode (mdl); 
                              }                                 
                              
                              if (s=="module") {

                                  console.log ("Parsing module ... " + JSON.stringify (seq [s]));
                                  let newModule=this.parseModule (mdl);
                                  sequenceNode.children.push (newModule);
                              }                              
                              }                          
                          }
                          
                          seqIndex++;
                    }
                  }
               }
            }
        }

        //console.log ("Created tree: " + JSON.stringify (newData));
        
        return (newData);
    }

    /**
     * 
     */
    processDataChange (treeData: any) {
                
        console.log ("processDataChange ()");
        
        this.setState(treeData);
        
        this.extractData (treeData);
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
    
    addNode () {
        console.log ("addNode ()");
        
        var aData=this.state.treeData;

        if (aData==null)
        {
            return;
        }
        
        var newNode=new OrgTreeNode ();
        newNode.title="New Node";
        aData.push (newNode);
        
        var expanded:boolean=true;
        
        //this.setState(aData);
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
    render() 
    {        
        //const FakeNode = (({ node }) => (<div>FakeNode</div>));
        //FakeNode.propTypes = { node: PropTypes.object.isRequired };
        
        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Course Content</p>
                        <button type="button" className="btn btn-secondary" onClick={e => this.addNode ()}>Add Item</button>
                        <a className="nav-link" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                        <a className="nav-link" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                    </nav>
                    <SortableTree
                        treeData={this.state.treeData}
                        generateNodeProps={rowInfo => ({
                          onClick: () => console.log(1),
                        })}
                        onChange={ treeData => this.processDataChange({treeData}) }
                        //nodeContentRenderer={OrganizationNodeRenderer}
                        //nodeContentRenderer={FakeNode}
                    />
                </div>
        );
    }
}

export default OrganizationEditor;
