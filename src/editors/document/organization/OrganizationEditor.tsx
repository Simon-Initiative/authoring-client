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

import {IDRef,OrgTreeNode,SimonOrganization} from './OrganizationTypes'
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
    newData:Array<any>=[];

    /**
     * 
     */
    constructor(props) {
        //console.log ("OrganizationEditor ()");
        
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
        
        //this.fetchTitles(this.props.documentId);
        
        //this.processData (orgData);
    }    
    
    /**
     * 
     */
    fetchTitles(documentId: types.DocumentId) {
        //console.log ("fetchTitles ();");
        
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
       // console.log ("componentWillReceiveProps ();");
        
        if (this.props.documentId !== nextProps.documentId) 
        {
          //this.fetchTitles(nextProps.documentId);
        }
    }    
    
    /**
     * 
     */
    getTextFromNode (aNode: any) : string {
      var testString:string=aNode ['text'];        
      return (testString);
    }
    
    /**
     * 
     */
    addTextObject (aText,aValue)
    {
      let newTextObject:Object=new Object ();
      newTextObject [aText]=new Object ();
      newTextObject [aText]["text"]=aValue;
      return (newTextObject);
    }
    
    /**
     * Here we go from visual data to database-ready data. We walk the tree
     * and build a db JSON ready representation. We could have done this
     * recursively but since we have to tag every level with a certain type
     * in output tree it was easier to do this in one function.
     */
    extractData (dummy: any) {
        console.log ("extractData ()");
        //console.log ("From: " + JSON.stringify (this.newData));
        
        var root:Object=new Object ();
        root ["organization"]=new Array ();
        //console.log (JSON.stringify (treeData));
                
        for (var i=0;i<this.newData.length;i++)
        {            
           let orgObject=this.newData [i];
            
           //console.log ("orgObject: " + JSON.stringify (orgObject));
                        
           root ["organization"].push (this.addTextObject ("title",orgObject.title));
           root ["organization"].push (this.addTextObject ("description",orgObject.description));
           root ["organization"].push (this.addTextObject ("audience",orgObject.audience));
           var seqRoot=new Object ();                       
           root ["organization"].push (seqRoot);
           var sequences:Object=new Object ();
           seqRoot ["sequences"]=sequences;    

           // We can point directly to .children because we ensure in the constructor that 
           // this object always exists             
           for (var j=0;j<orgObject.children.length;j++)
           {
             var seqObject:OrgTreeNode=orgObject.children [j];
             var sequence:Array<Object>=new Array ();
             sequences["sequence"]=sequence;   

             console.log ("Adding module with title: " + seqObject.title);  
             sequence.push (this.addTextObject ("title",seqObject.title));
                          
             var moduleContainer:Object=new Object ();
             var moduleObj:Array<Object>=new Array();               
             moduleContainer ["module"]=moduleObj;  
               
             sequence.push (moduleContainer);

             for (var k=0;k<seqObject.children.length;k++)
             {
               var mObj:OrgTreeNode=seqObject.children [k];  

               moduleObj.push (this.addTextObject ("title",mObj.title));
             }
           } 
        }
        
        var formattedOrganization=JSON.stringify (root);
        
        console.log ("To: " + formattedOrganization);
        
        return (formattedOrganization);
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
        //console.log ("getNodeType ()");
        
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
        //console.log ("parseItem ()");
        
        var newNode: OrgTreeNode=new OrgTreeNode ();
        
        for (var i in anItem) {
            
            //console.log ("item: " + i);
            
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
        //console.log ("parseSection ()");
        
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
      //console.log ("parseModule ()");
        
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
              //console.log ("Found item");
              
              moduleNode.addNode (this.parseItem (mdl));
          }                
            
          if (s=="section") {
              //console.log ("Found section");
              
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
        
       // console.log ("processData ()");
        
        var newData:Array<SimonOrganization>=new Array ();
        
        for (var i in treeData) {
          var orgNode=new SimonOrganization (); 
          newData.push (orgNode);
          var oList=treeData [i]
                        
            if (i=='organization') {
               for (var k=0;k<oList.length;k++) {                   
                 var obj=oList [k];                 
                                      
                 for (var j in obj) {
                   var destNode = obj [j];
                                      
                   if (j=='title') {
                     console.log ("title: " + this.getTextFromNode (destNode));
                     orgNode.title=this.getTextFromNode (destNode);
                   }
                   
                   if (j=='description') {
                     console.log ("desc: " + this.getTextFromNode (destNode));
                     orgNode.description=this.getTextFromNode (destNode);
                   }
                       
                   if (j=='audience') {
                     console.log ("aud: " + this.getTextFromNode (destNode));
                     orgNode.audience=this.getTextFromNode (destNode);
                   }

                   if (j=='sequences') {
                     console.log ("org node: " + JSON.stringify (orgNode));
  
                     for (var sequenceObject in destNode)
                     {                          
                       if (sequenceObject=="sequence") // checking to make absolutely sure we're in the right place
                       {
                         let newSequence:OrgTreeNode=new OrgTreeNode ();
                         orgNode.addNode (newSequence);
                         var sequenceList: Array<any>= destNode [sequenceObject];   
                                                                
                         for (var t=0; t<sequenceList.length;t++) {
                           var seq=sequenceList [t];
        
                           for (var s in seq) {
                                      
                           var mdl=seq [s];
                                     
                           if (s=="title") {
                             console.log ("Found title: " + this.getTextFromNode (mdl));                                  
                             newSequence.title=this.getTextFromNode (mdl); 
                           }                                 
                                      
                           if (s=="module") {    
                             //console.log ("Parsing module ... " + JSON.stringify (seq [s]));
                             let newModule=this.parseModule (mdl);
                             newSequence.children.push (newModule);
                           }                              
                         }                          
                       }
                     }
                   }  
                 }   
               }
             }
          }
        }
        
        return (newData);
    }

    /**
     * 
     */
    processDataChange (treeData: any) {
                
        console.log ("processDataChange ()");
        
        this.extractData (treeData);        
        
        this.setState (treeData);                
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
    addNode () {
        //console.log ("addNode ()");
        
        var aData=this.state.treeData;

        if (aData==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode=new OrgTreeNode ();
        newNode.title="New Module";
        aData.push (newNode);
        
        this.setState(aData);
        
        /*
        var expanded:boolean=true;
        
        //this.setState(aData);
        this.setState({
            treeData: toggleExpandedForAll({
                treeData: this.state.treeData,
                expanded,
            }),
        });
        */
        
        this.extractData (this.state.treeData);
    }    

    /**
     * 
     */
    render() 
    {        
      this.newData=this.state.treeData;
      
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
                      generateNodeProps={rowInfo => ({ onClick: () => console.log("rowInfo onClick ()") })}
                      onChange={ treeData => this.processDataChange({treeData}) }
                      //nodeContentRenderer={OrganizationNodeRenderer}
                      //nodeContentRenderer={FakeNode}
                  />
              </div>
      );
    }
}

export default OrganizationEditor;
