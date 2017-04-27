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

import {OrgContentTypes,IDRef,OrgItem,OrgSection,OrgSequence,OrgModule,OrgOrganization} from './OrganizationTypes'
import OrganizationNodeRenderer from './OrganizationNodeRenderer';

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
  orgData: OrgOrganization;  
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
      super(props, {
        treeData: OrganizationEditor.processData(orgData),
        orgData: OrganizationEditor.createEmtpyOrganization(orgData)
      });
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
     * People might notice that this code is a bit odd because it will return
     * the last organization object under the root. Right now that is by design.
     * That might change as the specs change but at least we won't have to
     * redo the code.
     */
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
    
    /**
     * 
     */
    static getTextFromNode (aNode: any) : string {
        
      console.log ("getTextFromNode: " + JSON.stringify (aNode));
          
      // Check for old style text nodes  
      if (aNode ['#text']) { 
        return (aNode ['#text']);
      } 

      return ("");
    }
        
    /**
     * Here we go from visual data to database-ready data. We walk the tree
     * and build a db JSON ready representation. We could have done this
     * recursively but since we have to tag every level with a certain type
     * in output tree it was easier to do this in one function for now.
     */
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
    static getNodeContentType (aNode:any):string {
        
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
    static parseItem (anItem: any): OrgItem {
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
    static parseSection (aSection: any): OrgSection {
        console.log ("parseSection ()");
        
        //console.log ("parseSection: " + JSON.stringify (aSection));
        
        var newNode: OrgSection=new OrgSection ();
        newNode.id=aSection ["@id"];
        
        for (var i=0;i<aSection ["#array"].length;i++)
        {
            var potentialSection=aSection ["#array"] [i];
            
            for (var j in potentialSection) {
                if (j=="title") {
                  newNode.title=OrganizationEditor.getTextFromNode (potentialSection [j]);  
                }
                
                if (j=="item") {
                  newNode.addNode (OrganizationEditor.parseItem (potentialSection [j]));
                }
            }
        }

        return (newNode);
    }

    /**
     * 
     */
    static parseModule (aModule: any) : OrgItem {
      console.log ("parseModule ()");
                
      //console.log ("Parsing " + aModule ["#array"].length + " module sub items ...");  
        
      let moduleNode:OrgModule=new OrgModule (); 
      moduleNode.id=aModule ["@id"]; 
      for (var t=0; t<aModule ["#array"].length;t++) {

        var mdl=aModule ["#array"] [t];
          
        var typeSwitch:string=OrganizationEditor.getNodeContentType (mdl);
                                   
        if (typeSwitch=="title") {
          //console.log ("Found module title: " + this.getTextFromNode (mdl ["title"]));                                  
          moduleNode.title=OrganizationEditor.getTextFromNode (mdl ["title"]); 
        }                                 
          
        if (typeSwitch=="item") {              
          moduleNode.addNode (OrganizationEditor.parseItem (mdl ["item"]));
        }                
            
        if (typeSwitch=="section") {              
          moduleNode.addNode (OrganizationEditor.parseSection (mdl ["section"]));
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
    static processData (treeData: any) {

        var newData:Array<OrgSequence>=new Array ();
                        
        for (var i in treeData) {
          var oList=treeData [i]["#array"];
                        
            if (i=='organization') {
               for (var k=0;k<oList.length;k++) {                   
                 var obj=oList [k];                 
                                      
                 for (var j in obj) {
                   var destNode = obj [j];

                   if (j=='sequences') {
                     //console.log ("org node: " + JSON.stringify (orgNode));
  
                     for (var sequenceObject in destNode)
                     {                          
                       if (sequenceObject=="sequence") // checking to make absolutely sure we're in the right place
                       {
                         let newSequence:OrgSequence=new OrgSequence ();
                         newData.push (newSequence);
                         newSequence.id = destNode [sequenceObject]["@id"];
                         newSequence.category = destNode [sequenceObject]["@category"];
                         newSequence.audience = destNode [sequenceObject]["@audience"];                           
                         var sequenceList: Array<any> = destNode [sequenceObject]["#array"];   
                                                                
                         for (var t=0; t<sequenceList.length;t++) {
                           var seq=sequenceList [t];
        
                           for (var s in seq) {
                             var mdl=seq [s];
                                                                    
                             if (s=="title") {
                               console.log ("Found sequence title: " + OrganizationEditor.getTextFromNode (mdl));                                  
                               newSequence.title=OrganizationEditor.getTextFromNode (mdl); 
                             }                                 
                                      
                             if (s=="module") {
                               let newModule=OrganizationEditor.parseModule (mdl);
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
     * This method is called by the tree component and even though we could access
     * the state directly we're going to assume that the tree component made some
     * changes that haven't been reflected in the global component state yet.
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

        this.extractData (immutableHelper);
        
        this.setState({treeData: immutableHelper});
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
    render() 
    { 
      //console.log ("render()");
          
      return (
              <div>
                  <div>
                      <h2 className="h2 organize" style={tempnavstyle.h2}>Course Content</h2>
                      <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                      <a className="btn btn-secondary" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                      <a className="btn btn-secondary" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                  </div>
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
