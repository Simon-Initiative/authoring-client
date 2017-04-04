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

import {IDRef,OrgItem,OrgSection,OrgSequence,OrgModule,OrgOrganization} from './OrganizationTypes'
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
     * in output tree it was easier to do this in one function for now.
     */
    extractData (dummy: any) {
        console.log ("extractData ()");
        
        let root:Object=new Object ();
        root ["organization"]=new Array ();
                
        for (let i=0;i<this.newData.length;i++)
        {            
           let orgObject=this.newData [i];
                                    
           root ["organization"].push (this.addTextObject ("title",orgObject.title));
           root ["organization"].push (this.addTextObject ("description",orgObject.description));
           root ["organization"].push (this.addTextObject ("audience",orgObject.audience));
           let seqRoot=new Object ();
           root ["organization"].push (seqRoot);
           let sequences:Object=new Object ();
           seqRoot ["sequences"]=sequences;    

           // We can point directly to .children because we ensure in the constructor that 
           // this object always exists             
           for (let j=0;j<orgObject.children.length;j++)
           {
             let seqObject:OrgItem=orgObject.children [j];
             let sequence:Array<Object>=new Array ();
             sequences["sequence"]=sequence;   

             console.log ("Adding sequence with title: " + seqObject.title);  
             sequence.push (this.addTextObject ("title",seqObject.title));
                            
             for (let k=0;k<seqObject.children.length;k++)
             {
               console.log ("Module: " + seqObject.children [k].title);
                 
               let moduleObj:Array<Object>=new Array();               
               let moduleContainer:Object=new Object ();
               moduleContainer ["module"]=moduleObj;  
               
               sequence.push (moduleContainer);
         
               let mObj:OrgItem=seqObject.children [k];
               moduleObj.push (this.addTextObject ("title",mObj.title));
                 
               for (let l=0;l<mObj.children.length;l++)
               {
                 console.log ("Section: " + mObj.children [l].title);
                   
                 let sectionObj:Array<Object>=new Array();               
                 let sectionContainer:Object=new Object ();
                 sectionContainer ["section"]=sectionObj;  
               
                 moduleObj.push (sectionContainer);
                   
                 let sObj:OrgItem=mObj.children [l];
                 sectionObj.push (this.addTextObject ("title",sObj.title));                   

                 for (let m=0;m<sObj.children.length;m++)
                 {
                   let iObj=sObj.children [m];
                     
                   /*  
                   if (iObj.isLeaf ()==true) {
                     sectionObj.push (iObj.toExternalObject ());
                   }
                   else {
                     // If we're here that means an author has gone beyond the nesting level we find in
                     // traditional OLI organizations    
                   }
                   */ 
                 }
               }  
             }
           }
        }
        
        var formattedOrganization=JSON.stringify (root);
        
        //console.log ("To: " + formattedOrganization);
        
        return (formattedOrganization);
    }
    
    /**
     * 
     */
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
     * 
     */
    getNodeContentType (aNode:any):string {
        
        //console.log ("getNodeContentType: " + JSON.stringify (aNode));
        
        if (aNode==null) {
            return "";
        }
        
        if (aNode ["title"]) {
          return ("title");
        }
        
        if (aNode ["section"]) {
          return ("section");
        }        
        
        if (aNode ["sequence"]) {
          return ("section");
        }        
        
        if (aNode ["module"]) {
          return ("module");
        }
        
        if (aNode ["item"]) {
          return ("item");
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
    parseItem (anItem: any): OrgItem {
        //console.log ("parseItem ()");
        
        var newNode: OrgItem=new OrgItem ();
        
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
    parseSection (aSection: any): OrgSection {
        console.log ("parseSection ()");
        
        console.log ("parseSection: " + JSON.stringify (aSection));
        
        var newNode: OrgSection=new OrgSection ();
        newNode.id=aSection ["@id"];
        
        for (var i=0;i<aSection ["#array"].length;i++)
        {
            var potentialSection=aSection ["#array"] [i];
            
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
    parseModule (aModule: any) : OrgItem {
      console.log ("parseModule ()");
                
      //console.log ("Parsing " + aModule ["#array"].length + " module sub items ...");  
        
      let moduleNode:OrgModule=new OrgModule (); 
      moduleNode.id=aModule ["@id"]; 
      for (var t=0; t<aModule ["#array"].length;t++) {

        var mdl=aModule ["#array"] [t];
          
        var typeSwitch:string=this.getNodeContentType (mdl);
                                   
        if (typeSwitch=="title") {
          //console.log ("Found module title: " + this.getTextFromNode (mdl ["title"]));                                  
          moduleNode.title=this.getTextFromNode (mdl ["title"]); 
        }                                 
          
        if (typeSwitch=="item") {              
          moduleNode.addNode (this.parseItem (mdl ["item"]));
        }                
            
        if (typeSwitch=="section") {              
          moduleNode.addNode (this.parseSection (mdl ["section"]));
        }
      }
        
      //console.log ("Result " + JSON.stringify (moduleNode));  
        
      return (moduleNode);
    }
    
    /**
     * This method goes from external format to the format used by the tree renderer
     * Note that the tree widget needs to maintain any attributes we add to a node
     * object. Otherwise we can't annotate and enrich the structuer. 
     */
    processData (treeData: any) {

        var newData:Array<OrgOrganization>=new Array ();
        
        for (var i in treeData) {
          var orgNode=new OrgOrganization (); 
          newData.push (orgNode);
          orgNode.id=treeData [i]["@id"];
          orgNode.version=treeData [i]["@version"];
          var oList=treeData [i]["#array"];
                        
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
                         let newSequence:OrgSequence=new OrgSequence ();
                         orgNode.addNode (newSequence);                          
                         newSequence.id = destNode [sequenceObject]["@id"];
                         newSequence.category = destNode [sequenceObject]["@category"];
                         newSequence.audience = destNode [sequenceObject]["@audience"];                           
                         var sequenceList: Array<any> = destNode [sequenceObject]["#array"];   
                                                                
                         for (var t=0; t<sequenceList.length;t++) {
                           var seq=sequenceList [t];
        
                           for (var s in seq) {
                             var mdl=seq [s];
                                                                    
                             if (s=="title") {
                               console.log ("Found sequence title: " + this.getTextFromNode (mdl));                                  
                               newSequence.title=this.getTextFromNode (mdl); 
                             }                                 
                                      
                             if (s=="module") {
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
        
        //console.log ("Transformed data: " + JSON.stringify (newData));
        
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
    addNode (anEvent) {
        //console.log ("addNode ()");
        
        var immutableHelper = this.state.treeData.slice()
        
        var aData=this.state.treeData;

        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        var newNode=new OrgItem ();
        newNode.title="New Item";
        immutableHelper.push (newNode);

        this.extractData (immutableHelper);
        
        this.setState({treeData: immutableHelper});
    }    

    /**
     * 
     */
    render() 
    { 
      console.log ("render()");       
          
      return (
              <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                  <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                      <p className="h2" style={tempnavstyle.h2}>Course Content</p>
                      <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                      <a className="nav-link" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                      <a className="nav-link" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                  </nav>
                  <SortableTree
                      maxDepth={5}
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
