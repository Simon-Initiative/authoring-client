import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import { TextInput } from 'editors/content/common/TextInput';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { LegacyTypes } from 'data/types';
import guid from 'utils/guid';
import {
  locateNextOfKin, findNodeByGuid,
  handleBranchingReordering, handleBranchingDeletion,
} from 'editors/document/assessment/utils';
import { Collapse } from 'editors/content/common/Collapse';
import { AddQuestion } from 'editors/content/question/addquestion/AddQuestion';
import { renderAssessmentNode } from 'editors/document/common/questions';
import { getChildren, Outline, setChildren, EditDetails }
  from 'editors/document/assessment/outline/Outline';
import { updateNode, removeNode } from 'data/utils/tree';
import { hasUnknownSkill } from 'utils/skills';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { Resource, ResourceState } from 'data/content/resource';
import * as Messages from 'types/messages';
import { buildMissingSkillsMessage } from 'utils/error';
import './AssessmentEditor.scss';
import { ToolbarButtonMenuDivider } from 'components/toolbar/ToolbarButtonMenu';
import { ContentElement } from 'data/content/common/interfaces';

interface Props extends AbstractEditorProps<models.FeedbackModel> {
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  course: models.CourseModel;
  currentNode: models.FeedbackQuestionNode;
}

interface State extends AbstractEditorState {
  collapseInsertPopup: boolean;
}

export default class AssessmentEditor extends AbstractEditor<models.FeedbackModel, Props, State> {

  state: State = {
    ...this.state,
    collapseInsertPopup: true,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return this.props.model !== nextProps.model
      || this.props.activeContext !== nextProps.activeContext
      || this.props.expanded !== nextProps.expanded
      || this.props.editMode !== nextProps.editMode
      || this.props.hover !== nextProps.hover
      || this.state.undoStackSize !== nextState.undoStackSize
      || this.state.redoStackSize !== nextState.redoStackSize;
  }

  componentWillReceiveProps(nextProps: Props) {
    // this.checkActiveNodeStillExists(nextProps);
  }

  // checkActiveNodeStillExists = (nextProps: Props) => {
  //   // Handle the case that the current node has changed externally,
  //   // for instance, from an undo/redo
  //   if (this.props.currentNode === nextProps.currentNode &&
  //  this.props.model !== nextProps.model) {

  //     const currentPage = this.getCurrentPage(nextProps);
  //     const { activeContext, onSetCurrentNodeOrPage } = this.props;
  //     const documentId = activeContext.documentId.valueOr(null);

  //     findNodeByGuid(currentPage.nodes, this.props.currentNode.guid)
  //       .caseOf({
  //         // If the node is still part of the current page, select the same node as active
  //         just: (currentNode) => {
  //           onSetCurrentNodeOrPage(documentId, currentNode);
  //         },
  //         // Else there was some sort of external change, and an adjacent node needs to be
  //         // selected as active
  //         nothing: () => {
  //           locateNextOfKin(
  //             this.props.model.questions, this.props.currentNode.guid).lift(node =>
  //               onSetCurrentNodeOrPage(documentId, node));
  //         },
  //       });
  //   }
  // }

  onTitleEdit = (ct: ContiguousText, src: ContentElement) => {
    const { model, onEdit } = this.props;
    const t = ct.extractPlainText().valueOr('');

    onEdit(model.with({
      title: model.title.with({
        text: model.title.text.with({
          content: model.title.text.content.set(ct.guid, ct),
        }),
      }),
      resource: model.resource.with({ title: t }),
    }));
  }

  onEditNode = (guid: string, node: models.Node, src: ContentElement) => {

    const { activeContext, context, model, onUpdateContent } = this.props;

    const nodes = model.questions;

    onUpdateContent(context.documentId, src);

    // this.handleEdit(model.with({
    //   questions: updateNode(guid, node, nodes, getChildren, setChildren),
    // }));
  }

  // This handles updates from the outline component, which are only reorders
  onEditNodes(nodes: Immutable.OrderedMap<string, models.Node>, editDetails: EditDetails) {

    const { model } = this.props;

    // this.handleEdit(model.with({
    //   questions: nodes,
    // }));
  }

  onChangeExpansion(nodes: Immutable.Set<string>) {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect(selectedNode: contentTypes.Node) {
    const { activeContext } = this.props;

    const documentId = activeContext.documentId.valueOr(null);

    // onSetCurrentNodeOrPage(documentId, selectedNode);
  }

  // allNodes() {
  //   return this.props.model.pages.reduce(
  //     (nodes, page) => nodes.concat(page.nodes).toOrderedMap(),
  //     Immutable.OrderedMap<string, contentTypes.Node>());
  // }

  // canRemoveNode() {
  //   const x = (node: models.Node) =>
  //     node.contentType === 'x' || node.contentType === 'x';

  //   return this.allNodes().filter(x).size > 1;
  // }

  // onNodeRemove = (guid: string) => {
  //   // Find the node to be removed, remove it, and set an adjacent node to be active.
  //   // Branching assessments are handled as a special case since they must remove
  //   // edges when a linked-to node is deleted.

  //   // const { model, activeContext, onSetCurrentNodeOrPage } = this.props;
  //   // const currentPage = this.getCurrentPage(this.props);
  //   const documentId = activeContext.documentId.valueOr(null);

  //   // Prevent the last node from being removed
  //   if (this.allNodes().size <= 1) {
  //     return;
  //   }

  //   locateNextOfKin(this.allNodes(), guid).lift((node) => {
  //     onSetCurrentNodeOrPage(documentId, node);
  //   });

  //   const nodes = removeNode(guid, currentPage.nodes, getChildren, setChildren);
  //   const pages = nodes.size > 0
  //     ? model.pages.set(currentPage.guid, currentPage.with({ nodes }))
  //     : model.pages.remove(currentPage.guid);

  //   this.handleEdit(model.with({ pages }));
  // }

  addQuestion(question: contentTypes.Question) {
    if (!this.props.editMode) return;

    const content = question.with({ guid: guid() });
    // this.addNode(content);
    this.setState({
      collapseInsertPopup: true,
    });
  }

  // addNode(node: models.Node) {
  //   const { model, activeContext, onSetCurrentNodeOrPage } = this.props;

  //   // Branching assessments place each question on a separate page
  //   let page = model.branching
  //     ? new contentTypes.Page()
  //     : this.getCurrentPage(this.props);

  //   page = page.with({ nodes: page.nodes.set(node.guid, node) });

  //   onSetCurrentNodeOrPage(activeContext.documentId.valueOr(null), node);
  //   this.handleEdit(model.with({
  //     pages: model.pages.set(page.guid, page),
  //   }));
  // }

  onRemove() {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onPaste(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onDuplicate(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onMoveUp(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onMoveDown(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onTypeChange = (type: string) => {
    const { model } = this.props;

    this.handleEdit(model.with({
      resource:
        model.resource.with({
          type,
        }),
    }));
  }

  // onSelectPool = () => {
  //   if (!this.props.editMode) return;

  //   const predicate = (res: Resource): boolean =>
  //     res.type === LegacyTypes.assessment2_pool
  //     && res.resourceState !== ResourceState.DELETED;

  //   this.props.services.displayModal(
  //     <ResourceSelection
  //       filterPredicate={predicate}
  //       courseId={this.props.context.courseId}
  //       onInsert={this.onInsertPool}
  //       onCancel={this.onCancelSelectPool} />);
  // }

  // onCancelSelectPool = () => {
  //   this.props.services.dismissModal();
  // }

  // onInsertPool = (resource: Resource) => {
  //   this.props.services.dismissModal();

  //   // Handle case where Insert is clicked after no pool selection is made
  //   if (!resource || resource.id === '') {
  //     return;
  //   }

  //   this.props.services.fetchIdByGuid(resource.guid)
  //     .then((idref) => {
  //       const pool = new contentTypes.Selection({ source: new contentTypes.PoolRef({ idref }) });
  //       this.addNode(pool);
  //       this.setState({
  //         collapseInsertPopup: true,
  //       });
  //     });
  // }

  renderSettings() {
    return (
      <Collapse caption="Settings">
        <div style={{ marginLeft: '25px' }}>
          <form>

            <div className="form-group row">

            </div>

            <div className="form-group row">

            </div>
          </form>
        </div>
      </Collapse>
    );
  }

  renderAdd() {
    const { editMode } = this.props;
    const { collapseInsertPopup } = this.state;

    return (
      <React.Fragment>
        <div className={`insert-popup ${collapseInsertPopup ? 'collapsed' : ''}`}>
          <AddQuestion
            editMode={editMode}
            onQuestionAdd={this.addQuestion.bind(this)}
            assessmentType={LegacyTypes.feedback} />
        </div>
        <a onClick={this.collapseInsertPopup} className="insert-new">Insert new...</a>
      </React.Fragment>
    );
  }

  onFocus = (model: Object, parent: ParentContainer, textSelection: Maybe<TextSelection>) => {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  unFocus = () => {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, null, null, Maybe.nothing());
  }

  onAddNew(item) {

  }

  onEdit(item) {

  }

  onDuplicateQuestion = () => {
    // if (this.props.currentNode.contentType === 'Question') {
    //   const duplicated = this.props.currentNode.clone();
    //   this.addNode(duplicated);
    // }
  }

  collapseInsertPopup = () => {
    this.setState({
      collapseInsertPopup: !this.state.collapseInsertPopup,
    });
  }

  render() {
    const { context, services, editMode, model, course, currentNode, onEdit } = this.props;

    // const page = this.getCurrentPage(this.props);

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(model.questions.toArray().map(n => n.guid));

    const activeContentGuid = this.props.activeContext.activeChild.caseOf({
      just: c => c.guid,
      nothing: () => '',
    });

    const feedbackNodeProps = {
      ...this.props,
      skills: this.props.context.skills,
      activeContentGuid,
    };

    return (
      <div className="feedback-editor">
        <ContextAwareToolbar editMode={editMode} context={this.props.context} model={model} />
        <div className="feedback-content">
          <div className="html-editor-well" onClick={() => this.unFocus()}>

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={(model.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            <div className="outline-and-node-container">
              <div className="outline-container">
                <Outline
                  editMode={this.props.editMode}
                  nodes={this.props.model.questions}
                  expandedNodes={expanded}
                  selected={currentNode.guid}
                  onEdit={this.onEditNodes.bind(this)}
                  onChangeExpansion={this.onChangeExpansion.bind(this)}
                  onSelect={this.onSelect.bind(this)}
                  course={course}
                />
                {this.renderAdd()}
              </div>
              <div className="node-container">
                {renderAssessmentNode(
                  currentNode, feedbackNodeProps, this.onEditNode,
                  this.onNodeRemove, this.onFocus, this.canRemoveNode(),
                  this.onDuplicateQuestion, this, false)}
              </div>
            </div>
          </div>
          <ContextAwareSidebar
            context={context}
            services={services}
            editMode={editMode}
            model={model}
            onEditModel={onEdit} />
        </div>
      </div>);
  }
}

