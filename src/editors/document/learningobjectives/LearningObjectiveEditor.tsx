import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import {LOTypes, LearningObjective} from '../../../data/los';
import * as types from '../../../data/types';
import {initWorkbook, resourceQuery, titlesForCoursesResources} from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../common/AbstractEditor';

import SortableTree from 'react-sortable-tree';
import {toggleExpandedForAll} from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

import {OrgContentTypes, IDRef, OrgItem, OrgSection, OrgSequence, OrgModule, OrgOrganization} from '../../../data/org';
import LONodeRenderer from './LONodeRenderer';
import LearningObjectiveLinker from '../../../components/LinkerDialog';
import {AppContext} from '../../common/AppContext';

const tempnavstyle = {
  h2: {
    marginRight: '10px'
  }
};

interface LearningObjectiveEditor {

}

export interface LearningObjectiveEditorState extends AbstractEditorState {
  treeData: any;
  modalIsOpen: boolean;
  model: any;
  context: AppContext;
  skills: any;
  target: any;
  document: any;
  documentId: string;
  titleIndex: number;
}

export interface LearningObjectiveEditorProps extends AbstractEditorProps<models.CourseModel> {
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;
  context: AppContext;
}

/**
 *
 */
class LearningObjectiveEditor extends AbstractEditor<models.CourseModel, LearningObjectiveEditorProps, LearningObjectiveEditorState> {

  /**
   *
   */
  constructor(props) {
    console.log("LearningObjectiveEditor ()");

    super(props, {
      treeData: [],
      context: props.context,
      skills: null,
      target: null,
      documentId: props.context.documentId,
      model: props.model,
      document: {},
      modalIsOpen: false,
      titleIndex: 0
    });
  }

  /**
   *
   */
  componentDidMount() {
    console.log("componentDidMount ()");
    let docu = new persistence.Document({
      _courseId: this.props.context.courseId,
      _id: this.props.model.guid,
      model: this.props.model
    });
    console.log(JSON.stringify(this.props.model.los));
    this.setState({treeData: this.props.model.los, document: docu});

    // persistence.retrieveDocument(this.state.context.courseId).then(course => {
    //     let loObject=course ["model"]["learningobjectives"];
    //     let loDocId=loObject.get (0);
    //
    //     persistence.retrieveDocument(loDocId).then(doc => {
    //       this.setState ({treeData: doc ["model"]["los"],document: doc});
    //     });
    //
    //     let skillObject=course ["model"]["skills"];
    //     let skillDocId=skillObject.get (0);
    //
    //     persistence.retrieveDocument(skillDocId).then(skillDoc => {
    //       this.setState ({skills: skillDoc ["model"]["skills"]});
    //     });
    // });
  }

  /**
   *
   */
  loadDocument(anID: string): any {
    console.log("loadDocument (" + anID + ")");
    const docu = new persistence.Document({
      _courseId: this.props.context.courseId,
      _id: this.props.model.guid,
      model: this.props.model
    });
    this.setState({treeData: this.props.model.los, document: docu});
    // persistence.retrieveDocument(anID).then(doc => {
    //     this.setState ({modalIsOpen: false, treeData: doc.model ["los"],document: doc});
    //     return (doc);
    // });

    return (null);
  }

  /**
   * This method is called by the tree component and even though we could access
   * the state directly we're going to assume that the tree component made some
   * changes that haven't been reflected in the global component state yet.
   */
  processDataChange(newData: any) {
    console.log("processDataChange ()");

    this.saveToDB(newData);
  }

  /**
   *
   */
  expand(expanded) {
    this.setState({
      modalIsOpen: false,
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
  static getTextFromNode(aNode: any): string {

    console.log("getTextFromNode: " + JSON.stringify(aNode));

    // Check for old style text nodes
    if (aNode ['#text']) {
      return (aNode ['#text']);
    }

    return ("");
  }

  /**
   *
   */
  assignParent(aLOObject: LearningObjective, anId: string): void {
    console.log("assignParent ()");

    aLOObject.parent = anId;

    for (let i = 0; i < aLOObject.children.length; i++) {
      let loHelper = aLOObject.children [i];

      this.assignParent(loHelper, aLOObject.id);
    }
  }

  /**
   *
   */
  assignParents(newData: any): void {
    let immutableHelper = this.state.treeData.slice();

    if (newData) {
      console.log("We have alternative facts, let's use those instead ...");

      if (newData ["treeData"]) {
        immutableHelper = newData ["treeData"];
      } else {
        immutableHelper = newData;
      }
    }

    if (immutableHelper == null) {
      console.log("Bump");
      return;
    }

    console.log("assignParents (" + immutableHelper.length + ")");

    for (let i = 0; i < immutableHelper.length; i++) {
      this.assignParent(immutableHelper [i], "");
    }

    return (immutableHelper);
  }

  /**
   *
   */
  saveToDB(newData?: any): void {
    console.log("saveToDB ()");
    if (newData) {

      this.setState({
        modalIsOpen: false,
        treeData: this.assignParents(newData)
      }, function () {
        console.log("Parented: " + JSON.stringify(this.state.treeData));
        var newModel = models.LearningObjectiveModel.updateModel(this.state.treeData);

        var updatedDocument = this.state.document.set('model', newModel);

        this.setState({'document': updatedDocument}, function () {
          persistence.persistDocument(this.state.document)
            .then(result => {
              console.log("Document saved, loading to get new revision ... ");
              this.loadDocument(this.state.documentId);
            });
        });
      });

    } else {
      console.log("Parented: " + JSON.stringify(this.state.treeData));
      var newModel = models.LearningObjectiveModel.updateModel(this.state.treeData);

      var updatedDocument = this.state.document.set('model', newModel);

      this.setState({'document': updatedDocument}, function () {
        persistence.persistDocument(this.state.document)
          .then(result => {
            console.log("Document saved, loading to get new revision ... ");
            this.loadDocument(this.state.documentId);
          });
      });
    }
  }

  /**
   * Note that this manual method of adding a new node does not generate an
   * onChange event. That's why we call extractData manually as the very
   * last function call.
   */
  addNode(anEvent) {

    console.log("addNode ()");

    var immutableHelper = this.state.treeData.slice();

    if (immutableHelper == null) {
      console.log("Bump");
      return;
    }

    var newNode: LearningObjective = new LearningObjective();
    newNode.title = ("Title " + this.state.titleIndex);
    immutableHelper.push(newNode);

    this.setState({titleIndex: this.state.titleIndex + 1});

    this.setState({
      modalIsOpen: false,
      treeData: immutableHelper
    }, function () {
      this.saveToDB();
    });
  }

  /**
   *
   */
  findTreeParent(aTree: any, aNode: any): Array<Object> {
    console.log("findTreeParent (" + aNode.id + ")");

    for (var i = 0; i < aTree.length; i++) {
      let testNode: OrgItem = aTree [i];

      if (testNode.id == aNode.id) {
        return (aTree);
      }

      // We can test length here because we always make sure this object exists
      if (testNode.children.length > 0) {
        let result: Array<Object> = this.findTreeParent(testNode.children, aNode);

        if (result != null) {
          return (result);
        }
      }
    }

    return (null);
  }

  /**
   *
   */
  deleteNode(aNode: any): void {
    console.log("LearningObjectiveEditor:deleteNode ()");

    var immutableHelper = this.state.treeData.slice();

    let parentArray: Array<Object> = this.findTreeParent(immutableHelper, aNode);

    if (immutableHelper == null) {
      console.log("Bump");
      return;
    }

    /*
     for (var i=0;i<immutableHelper.length;i++) {
     let testNode:LearningObjective=immutableHelper [i];

     if (testNode.id==aNode.id) {
     immutableHelper.splice (i,1);
     break;
     }
     }
     */

    for (var i = 0; i < parentArray.length; i++) {
      let testNode: OrgItem = parentArray [i] as OrgItem;

      if (testNode.id == aNode.id) {
        parentArray.splice(i, 1);
        break;
      }
    }

    //console.log ("New Tree: " + JSON.stringify (immutableHelper));

    //this.setState({modalIsOpen: false,treeData: immutableHelper});

    this.saveToDB(immutableHelper);
  }

  /**
   *
   */
  editTitle(aNode: any, aTitle: any): void {
    console.log("LearningObjectiveEditor:editTitle ()");

    //let newTitle=aTitle.title.get ("#text");
    let newTitle = aTitle.text;

    var immutableHelper = this.state.treeData.slice();

    if (immutableHelper == null) {
      console.log("Bump");
      return;
    }

    for (var i = 0; i < immutableHelper.length; i++) {
      let testNode: LearningObjective = immutableHelper [i];

      if (testNode.id == aNode.id) {
        testNode.title = newTitle;
        break;
      }
    }

    //this.setState({modalIsOpen: false,treeData: immutableHelper});

    this.saveToDB(immutableHelper);
  }

  /**
   *
   */
  linkSkill(aNode: any) {
    console.log("linkSkill ()");
    console.log("aNode: " + JSON.stringify(aNode));

    this.setState({modalIsOpen: true, target: aNode});
  }

  /**
   *
   */
  genProps() {
    //console.log ("LearningObjectiveEditor:genProps ()");

    var optionalProps: Object = new Object();

    optionalProps ["editNodeTitle"] = this.editTitle.bind(this);
    optionalProps ["deleteNode"] = this.deleteNode.bind(this);
    optionalProps ["linkAnnotation"] = this.linkSkill.bind(this);
    optionalProps ["treeData"] = this.state.treeData;

    return (optionalProps);
  }

  /**
   *
   */
  closeModal() {
    console.log("LearningObjectiveEditor: closeModal ()");

    this.saveToDB();
  }

  /**
   *
   */
  createLinkerDialog() {
    if (this.state.skills != null) {
      return (<LearningObjectiveLinker closeModal={this.closeModal.bind(this)} sourceData={this.state.skills}
                                       modalIsOpen={this.state.modalIsOpen} target={this.state.target}/>);
    } else {
      console.log("Internal error: no skills object can be empty but not null");
    }

    return (<div></div>);
  }

  /**
   *
   */
  render() {
    const skilllinker = this.createLinkerDialog();

    return (
      <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
        <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
          <p className="h2" style={tempnavstyle.h2}>Learning Objectives</p>
          <button type="button" className="btn btn-secondary" onClick={e => this.addNode(e)}>Add Item</button>
          <a className="nav-link" href="#" onClick={e => this.expandAll()}>+ Expand All</a>
          <a className="nav-link" href="#" onClick={e => this.collapseAll()}>- Collapse All</a>
        </nav>
        {skilllinker}
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
