import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import {Skill} from '../../../data/skills';
import { CourseResource, fetchCourseResources } from '../common/resources';

import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { AppServices } from '../../common/AppServices';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';

import NodeRendererDefault from 'react-sortable-tree';

import SkillNodeRenderer from './SkillNodeRenderer';

// From: https://www.npmjs.com/package/rc-slider
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

var skillData=require ('./Skills.json');

const styles = {
  skillContainer : {
    "marginTop" : "10px"
  },
    
  skillTitleEditorFolded : {
    "color" : "#0067cb"
  },
  
  skillTitleEditorUnfolded : {
    "color" : "#ffffff"
  }, 

  skillRowUnselected: {
    "border": "0px solid grey",
    "background": "#ffffff",
    "height": "50px",
    "marginBottom" : "10px",
    "padding" : "2px",
    "display" : "flex",
    "flexDirection" : "column"
  },
  
  skillRowSelected: {
    "border": "0px solid blue",
    "background": "#0067cb",
    "height": "120px",
    "marginBottom" : "10px",
    "padding" : "2px",
    "display" : "flex",    
    "flexDirection" : "column"
  },     
    
  titleContainer : {
    "border" : "0px solid grey",
    "height": "40px",
    "flex": "1",
    "margin" : "1px",
    "verticalAlign": "middle"
  },
    
  toolContainer : {      
      "margin" : "15px" 
  },
  
  orgrowTitleFolded : {    
    "border": "0px solid red",
    "height": "40px",
    "overflowY": "hidden",
    "overflowX": "hidden",
    "margin" : "0px", 
    "fontFamily" : "'Roboto Slab', serif",
    "verticalAlign": "middle",
    "lineHeight": "40px",
    "color" : "#0067cb"
  },
  
  orgrowTitleUnfolded : {    
    "border": "0px solid red",
    "height": "40px",
    "overflowY": "hidden",
    "overflowX": "hidden",
    "margin" : "0px", 
    "fontFamily" : "'Roboto Slab', serif",
    "verticalAlign": "middle",
    "lineHeight": "40px",
    "color" : "white"      
  },  
  
  titleBarFolded : {
    "display" : "flex",
    "flexDirection" : "row",
    "height": "50px",
    "color" : "#0067cb"
  },
  
  titleBarUnfolded : {
    "display" : "flex",
    "flexDirection" : "row",
    "height": "50px",
    "color" : "white"    
  },  
  
  controlBar : {
    "background" : "#ffffff",
    "display" : "flex",
    "flexDirection" : "row",
    "flex": "1",
    "visibility" : "visible"    
  },
  
  controlBarHidden : {
    "background" : "#ffffff",
    "display" : "flex",
    "flexDirection" : "row",
    "flex": "1",
    "visibility" : "hidden"
  },
  
  sliderPanel: {
    "border" : "0px solid grey",
    "width" : "75px",
    "height" : "35px",
    "fontSize" : "10pt",
    "margin" : "10px"
  }
};
    
const tempnavstyle=
{
    h2: {
        marginRight: '10px'
    }
};

interface SkillEditor {

}

export interface SkillEditorState extends AbstractEditorState {
  model: models.SkillModel;
  treeData : any;
  documentId: string;
  document: any;
}

export interface SkillEditorProps extends AbstractEditorProps<models.SkillModel> {
  dispatch: any;
  documentId: string;
  userId: string;
}

/**
*
*/
class SkillEditor extends AbstractEditor<models.SkillModel,SkillEditorProps, SkillEditorState> 
{            
    /**
     * 
     */
    constructor(props) {
        
        super(props,{
                        treeData: [],
                        documentId: props.context.documentId,
                        model: props.model,
                        document: {}
                    });            
    }
    
    componentDidMount () {
        console.log ("componentDidMount ("+this.state.documentId+")");
        
        this.loadDocument(this.state.documentId);
    }
    
    componentWillReceiveProps(nextProps) {
        console.log ("componentWillReceiveProps ();");
        console.log ("Props: " + JSON.stringify (nextProps));    
    }     

    /**
     * Just as a reference the Skills document should look something like
     * this:
     * {
     *   "_id": "cb0d5b137423d16d846aa77839001389",
     *   "_rev": "1-e9711c89ff6fe68d6ce1037056af836f",
     *   "modelType": "SkillModel",
     *   "title": {
     *     "text": "Sample Skill Model"
     *   },
     *   "skills": []
     * }
     */
    loadDocument (anID:string):any {
        console.log ("loadDocument ("+anID+")");

        persistence.retrieveDocument(anID).then(doc => {
            console.log ("Document loaded, assigning to state ...");
            console.log ("Model: " + JSON.stringify (doc.model));
            this.setState ({treeData: doc.model ["skills"],document: doc});
            return (doc);
        });
        
       return (null); 
    }    
    
    /**
     * 
     */
    processDataChange (newData: any) {
        console.log ("processDataChange ()");
        
        /*
        this.extractData (newData);        
        
        this.setState (newData);
        */       
    }
    
    /**
     * Here we go from visual data to database-ready data. We walk the tree
     * and build a db JSON ready representation. We could have done this
     * recursively but since we have to tag every level with a certain type
     * in output tree it was easier to do this in one function for now.
     */
    extractData (aData: any): Object {
        console.log ("extractData ()");
                                
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
     *
     */
    saveToDB (): void {
        console.log ("saveToDB ()");

        console.log ("Document: " + JSON.stringify (this.state.document));
        
        let immutableDocument = this.state.document;
        
        if (immutableDocument==null)
        {
            console.log ("immutableDocument is null, bump");
            return;
        }

        var extractedData:any=this.extractData (this.state.treeData);
                
        // Keep in mind that extractData creates a skills object, but in our
        // model we already have one so we need to extract the contents from
        // inside that object. Bit confusing prehaps but we'll clean it up
        // later.
        var newModel=immutableDocument.model.updateModel (extractedData.skills);
        //var newModel=this.state.document.model.updateModel (extractedData.skills);
                 
        var updatedDocument=this.state.document.set ('model',newModel);
               
        this.setState ({'document' : updatedDocument },function () {         
          persistence.persistDocument(this.state.document)
            .then(result => {
                console.log ("Document saved, loading to get new revision ... ");
                
                this.loadDocument (this.state.documentId);
            });
        }); 
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
    addNode (anEvent:any) {
        console.log ("addNode ()");
        
        let immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null)
        {
            console.log ("Bump");
            return;
        }
        
        let newNode:Skill=new Skill ();
        newNode.title="New Skill";
        immutableHelper.push (newNode);

        //let formattedData=this.extractData (immutableHelper);
                
        this.setState({treeData: immutableHelper},function (){         
          this.saveToDB ();
        });    
    }     

    /**
     *
     */    
    deleteNode (aNode:any): void {
        console.log ("SkillEditor:deleteNode ()");
            
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
        
        //let formattedData=this.extractData (immutableHelper);
                
        this.setState({treeData: immutableHelper},function (){         
          this.saveToDB ();
        });  
    }
    
    /**
     *
     */    
    editTitle (aNode:any, aTitle:any):void {
        console.log ("SkillEditor:editTitle ()");
        console.log ("content: " + JSON.stringify(aTitle));
        
        let newTitle=aTitle.text;
            
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
        
        //let formattedData=this.extractData (immutableHelper);
        
        this.saveToDB ();
        
        //this.setState({treeData: immutableHelper});    
    }
    
    /**
     * 
     */
    fold (aNode:any) : void {
        console.log ("SkillEditor:fold ()");      
                
        var immutableHelper = this.state.treeData.slice();
        
        if (immutableHelper==null) {
            console.log ("Bump");
            return;
        }
                
        for (var i=0;i<immutableHelper.length;i++) {
            let testNode:Skill=immutableHelper [i];
                        
            if (testNode.id==aNode.id) {
              if (testNode.folded==true) {
                testNode.folded=false;
              } else {
                testNode.folded=true;
              }
            }
            else {
                testNode.folded=true;
            }
        }
                
        this.setState({treeData: immutableHelper});          
    }    
    
    /**
     * 
     */
    handleOnChange (aChange) : void {
        console.log ("handleOnChange ()");
    }

    /**
     *
     */
    /*    
    genProps () {       
        var optionalProps:Object=new Object ();
        
        optionalProps ["editNodeTitle"]=this.editTitle.bind (this);
        optionalProps ["deleteNode"]=this.deleteNode.bind (this);
        optionalProps ["treeData"]=this.state.treeData;
        
        return (optionalProps);
    }
    */
        
    /**
     * 
     */
    render() {  
        //console.log ("SkillEditor:render ()");
                
        var options;
        const services = ({} as AppServices);
        
        /**
         * This will go into it's own renderer once the basic version is complete.
         */        
        options = this.state.treeData.map(function(item, index) 
        {
            var titleObj=new contentTypes.Title({ text: item.title })
            
            if (item.folded==true) {
              return (
                  <div id={'skill-' + index} key={'skill-' + index} style={styles.skillRowUnselected}>
                      <div style={styles.titleBarFolded}>
                         <div style={styles.titleContainer}>
                            <TitleContentEditor 
                             services={services}
                             editMode={true}
                             model={titleObj}
                             styles={styles.skillTitleEditorFolded}
                             context={{userId: null, documentId: null, courseId: null}}
                             onEdit={(content) => this.editTitle(item,content)}
                            />
                         </div>
                         <div style={styles.toolContainer}>
                           <a style={styles.orgrowTitleFolded} href="#" onClick={(e) => this.deleteNode (item,item.title)}><i className="fa fa-window-close">&nbsp;</i></a>
                           <a style={styles.orgrowTitleFolded} href="#" onClick={(e) => this.fold (item)}><i className="fa fa-angle-down">&nbsp;</i></a>
                         </div>  
                      </div>
                      <div style={styles.controlBarHidden}>
                      </div>        
                  </div> 
              );
            } else {
              return (
              <div id={'skill-' + index} key={'skill-' + index} style={styles.skillRowSelected}>
                      <div style={styles.titleBarUnfolded}>
                         <div style={styles.titleContainer}>
                            <TitleContentEditor 
                             services={services}
                             editMode={true}
                             model={titleObj}
                             styles={styles.skillTitleEditorUnfolded}
                             context={{userId: null, documentId: null, courseId: null}}
                             onEdit={(content) => this.editTitle(item,content)} 
                            />
                         </div>
                         <div style={styles.toolContainer}>
                           <a style={styles.orgrowTitleUnfolded} href="#" onClick={(e) => this.deleteNode (item,item.title)}><i className="fa fa-window-close">&nbsp;</i></a>
                           <a style={styles.orgrowTitleUnfolded} href="#" onClick={(e) => this.fold (item)}><i className="fa fa-angle-up">&nbsp;</i></a>
                         </div>  
                      </div>
                      <div style={styles.controlBar}>
                        <div style={styles.sliderPanel}>
                         pKnown: <Slider step={0.01} defaultValue={item.skillModel.pKnown} min={0} max={1}/>
                        </div>

                        <div style={styles.sliderPanel}>
                         pGuess: <Slider step={0.01} defaultValue={item.skillModel.pGuess} min={0} max={1}/>
                        </div>

                        <div style={styles.sliderPanel}>
                         pSlip: <Slider step={0.01} defaultValue={item.skillModel.pSlip} min={0} max={1}/>
                        </div>

                        <div style={styles.sliderPanel}>
                         pMastery: <Slider step={0.01} defaultValue={item.skillModel.pMastery} min={0} max={1}/>
                        </div>                             
                      </div>   
              </div>         
             );
            }
        }.bind(this));         

        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Skills</p>
                        <button type="button" className="btn btn-secondary" onClick={e => this.addNode (e)}>Add Item</button>
                        <select className="form-control">
                          <option value="bkt">Bayesian Knowledge Tracing</option>
                          <option value="oli">OLI Skill Modeling</option>
                        </select> 
                    </nav>                                  
                    <div style={styles.skillContainer}>
                    {options}
                    </div>        
                </div>
        );
    }
}

export default SkillEditor;
