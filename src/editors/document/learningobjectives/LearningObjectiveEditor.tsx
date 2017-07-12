import * as React from 'react';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import { LearningObjective } from '../../../data/content/los';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';

import { UndoRedoToolbar } from '../common/UndoRedoToolbar';

import { OrgItem } from '../../../data/content/org';
import LONodeRenderer from './LONodeRenderer';
import LearningObjectiveLinker from '../../../components/LinkerDialog';
import { AppContext } from '../../common/AppContext';

const tempnavstyle = {
  h2: {
    marginRight: '10px',
  },
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

export interface LearningObjectiveEditorProps extends
  AbstractEditorProps<models.LearningObjectiveModel> {
  dispatch: any;
  documentId: string;
  document: any;
  userId: string;
  context: AppContext;
}

/**
 *
 */
class LearningObjectiveEditor extends AbstractEditor<models.LearningObjectiveModel,
  LearningObjectiveEditorProps, LearningObjectiveEditorState> {

  /**
   *
   */
  constructor(props) {
    console.log('LearningObjectiveEditor ()');

    super(props, {
      treeData: [],
      context: props.context,
      skills: null,
      target: null,
      documentId: props.context.documentId,
      model: props.model,
      document: {},
      modalIsOpen: false,
      titleIndex: 0,
    });
  }

  /**
   *
   */
  componentDidMount() {
    console.log('componentDidMount ()');
    const docu = new persistence.Document({
      _courseId: this.props.context.courseId,
      _id: this.props.model.guid,
      model: this.props.model,
    });

    this.setState({ treeData: this.props.model.los, document: docu }, function () {
      this.props.context.courseModel.resources.map((value, id) => {
        if (value.type === 'x-oli-skills_model') {
          persistence.retrieveDocument(this.props.context.courseId, id).then((skillDocument) => {
            const skillModel: models.SkillModel = skillDocument.model as models.SkillModel;
            const existingSkills = this.state.skills === null ? [] : this.state.skills;
            this.setState({ skills: [...existingSkills, ...skillModel.skills] });
          });
        }
      });
    });
  }

  /**
   * This method is called by the tree component and even though we could access
   * the state directly we're going to assume that the tree component made some
   * changes that haven't been reflected in the global component state yet.
   */
  processDataChange(newData: any) {
    console.log('processDataChange ()');

    this.onLOEdit(newData.treeData);
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

    console.log('getTextFromNode: ' + JSON.stringify(aNode));

    // Check for old style text nodes
    if (aNode ['#text']) {
      return (aNode ['#text']);
    }

    return ('');
  }

  /**
   *
   */
  assignParent(aLOObject: LearningObjective, anId: string): void {
    // console.log ("assignParent ()");

    aLOObject.parent = anId;
    aLOObject.children.forEach((loHelper) => {
      this.assignParent(loHelper, aLOObject.id);
    });
    // for (let i = 0; i < aLOObject.children.length; i++) {
    //   const loHelper = aLOObject.children [i];
    //
    //   this.assignParent(loHelper, aLOObject.id);
    // }
  }

  /**
   *
   */
  assignParents(newData: any): void {
    let immutableHelper = this.state.treeData.slice();

    if (newData) {
      // console.log ("We have alternative facts, let's use those instead ...");

      // We should really unify this across the code, it's very brittle
      if (newData ['treeData']) {
        immutableHelper = newData ['treeData'];
      } else {
        immutableHelper = newData;
      }
    }

    if (immutableHelper === null) {
      console.log('Bump');
      return;
    }

    // console.log ("assignParents ("+immutableHelper.length+")");
    immutableHelper.forEach((e) => {
      this.assignParent(e, '');
    });
    // for (let i = 0; i < immutableHelper.length; i++) {
    //   this.assignParent(immutableHelper [i], '');
    // }

    return (immutableHelper);
  }

  /**
   *
   */
  /*
   saveToDB (newData?:any): void {
   console.log ("saveToDB ()");
   this.onLOEdit (newData);
   }
   */

  /**
   *
   */
  onLOEdit(newData?: any) {
    console.log('onLOEdit ()');

    let newModel;

    const reparented: any = this.assignParents(newData);

    newModel = models.LearningObjectiveModel.updateModel(this.state.model, reparented);

    // console.log ("Giving the
    // following model to this.props.onLOEdit: " + JSON.stringify (newModel));

    this.setState({ modalIsOpen: false, treeData: newModel.los }, function () {
      // this.props.onEdit(newModel);
      this.handleEdit(newModel);
    });
  }

  /**
   * Note that this manual method of adding a new node does not generate an
   * onChange event. That's why we call extractData manually as the very
   * last function call.
   */
  addNode(anEvent) {

    console.log('addNode ()');

    const immutableHelper = this.state.treeData.slice();

    if (immutableHelper === null) {
      console.log('Bump');
      return;
    }

    const newNode: LearningObjective = new LearningObjective();
    newNode.title = ('Title ' + this.state.titleIndex);
    immutableHelper.push(newNode);

    this.setState({ modalIsOpen: false, titleIndex: this.state.titleIndex + 1 }, () => {
      this.onLOEdit(immutableHelper);
    });

    /*
     this.setState({
     modalIsOpen : false,
     treeData: immutableHelper
     },function (){
     this.saveToDB (immutableHelper);
     });
     */
  }

  /**
   *
   */
  findTreeParent(aTree: any, aNode: any): Array<Object> {
    console.log('findTreeParent (' + aNode.id + ')');

    for (let i = 0; i < aTree.length; i++) {
      const testNode: OrgItem = aTree [i];

      if (testNode.id === aNode.id) {
        return (aTree);
      }

      // We can test length here because we always make sure this object exists
      if (testNode.children.length > 0) {
        const result = this.findTreeParent(testNode.children, aNode);

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
    console.log('LearningObjectiveEditor:deleteNode ()');

    const immutableHelper = this.state.treeData.slice();

    const parentArray = this.findTreeParent(immutableHelper, aNode);

    if (immutableHelper === null) {
      console.log('Bump');
      return;
    }

    for (let i = 0; i < parentArray.length; i++) {
      const testNode: OrgItem = parentArray [i] as OrgItem;

      if (testNode.id === aNode.id) {
        // console.log ("Removing lo ("+i+") with title: " + aNode.title);
        parentArray.splice(i, 1);
        break;
      }
    }

    console.log('Updated tree: ' + JSON.stringify(immutableHelper));

    this.onLOEdit(immutableHelper);
  }

  /**
   *
   */
  editTitle(aNode: any, aTitle: any): void {
    console.log('LearningObjectiveEditor:editTitle ()');

    const newTitle = aTitle.text;

    const immutableHelper = this.state.treeData.slice();

    if (immutableHelper === null) {
      console.log('Bump');
      return;
    }

    for (let i = 0; i < immutableHelper.length; i++) {
      const testNode: LearningObjective = immutableHelper [i];

      if (testNode.id === aNode.id) {
        testNode.title = newTitle;
        break;
      }
    }

    this.onLOEdit(immutableHelper);
  }

  /**
   *
   */
  linkSkill(aNode: any) {
    console.log('linkSkill ()');

    this.setState({ modalIsOpen: true, target: aNode });
  }

  /**
   *
   */
  genProps() {
    const optionalProps: Object = new Object();

    optionalProps ['editNodeTitle'] = this.editTitle.bind(this);
    optionalProps ['deleteNode'] = this.deleteNode.bind(this);
    optionalProps ['linkAnnotation'] = this.linkSkill.bind(this);
    optionalProps ['treeData'] = this.state.treeData;

    return (optionalProps);
  }

  /**
   *
   */
  closeModal(newAnnotations: any) {

    const immutableHelper = this.state.treeData.slice();

    const parentArray = this.findTreeParent(immutableHelper, this.state.target);

    if (immutableHelper === null) {
      console.log('Bump');
      return;
    }

    for (let i = 0; i < parentArray.length; i++) {
      const testNode: OrgItem = parentArray [i] as OrgItem;

      if (testNode.id === this.state.target.id) {
        testNode.annotations = newAnnotations;
        break;
      }
    }

    this.setState({ modalIsOpen: false, treeData: immutableHelper }, function () {
      this.onLOEdit();
    });
  }

  /**
   *
   */
  createLinkerDialog() {
    let message = '';

    if (this.state.target) {
      if (!this.state.skills) {
        message = 'No skills available. Did you create a skills document?';
      }

      return (<LearningObjectiveLinker title="Available Learning Skills" errorMessage={message}
                                       closeModal={this.closeModal.bind(this)} sourceData={this.state.skills}
                                       modalIsOpen={this.state.modalIsOpen}
                                       targetAnnotations={this.state.target.annotations}/>);
    }

    return (<div></div>);
  }

  /**
   *
   */
  doUndo(): void {
    console.log('doUndo ()');

  }

  /**
   *
   */
  doRedo(): void {
    console.log('doRedo ()');

  }

  /**
   *
   */
  render() {
    const skilllinker = this.createLinkerDialog();

    // console.log ("Rendering: " + JSON.stringify (this.state.treeData));

    return (
      <div className="">
        <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
          <p className="h2" style={tempnavstyle.h2}>Learning Objectives</p>
          <button type="button" className="btn btn-secondary" onClick={e => this.addNode(e)}>Add Item</button>
          <UndoRedoToolbar onUndo={this.doUndo.bind(this)}
                           onRedo={this.doRedo.bind(this)}
                           undoEnabled={this.state.undoStackSize > 0}
                           redoEnabled={this.state.redoStackSize > 0}></UndoRedoToolbar>
        </nav>
        {skilllinker}
        <SortableTree
          maxDepth={3}
          treeData={this.state.treeData}
          onChange={ treeData => this.processDataChange({ treeData }) }
          nodeContentRenderer={LONodeRenderer}
          generateNodeProps={this.genProps.bind(this)}
        />
      </div>
    );
  }
}

export default LearningObjectiveEditor;
